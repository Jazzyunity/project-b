-- Extension pour générer des UUID si nécessaire (optionnel)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- GESTION DES UTILISATEURS ET ABONNEMENTS
-- ==========================================

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT,
    
    -- Statut Premium (Pour pouvoir contacter les créateurs Socrate)
    is_premium BOOLEAN DEFAULT FALSE,
    premium_until TIMESTAMP WITH TIME ZONE,
    
    -- Intégration Paiement Stripe
    stripe_customer_id VARCHAR(255),
    subscription_id VARCHAR(255),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des paiements / Transactions (Abonnements Premium et Achats Socrate)
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    status VARCHAR(20) NOT NULL, -- 'succeeded', 'pending', 'failed'
    payment_type VARCHAR(50) NOT NULL, -- 'premium_subscription', 'socrate_protocol_purchase'
    transaction_ref VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- STRUCTURE DES ÉVÉNEMENTS (ESPACES THÉMATIQUES)
-- ==========================================

CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    featured_idea_id INTEGER, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- CONCEPTS GENESIS ET PROTOCOLE SOCRATE
-- ==========================================

CREATE TABLE IF NOT EXISTS genesis_ideas (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL, -- Pitch complet
    
    -- Système de protection Socrate
    -- N'importe qui peut payer pour activer is_socrate
    is_socrate BOOLEAN DEFAULT FALSE, 
    
    -- Métadonnées
    genre VARCHAR(50) NOT NULL,
    platform VARCHAR(50) NOT NULL,
    
    -- Relations
    author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    event_id INTEGER REFERENCES events(id) ON DELETE SET NULL, 
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des demandes de contact (Réservé aux membres Premium)
-- Pour les idées sous protocole Socrate
CREATE TABLE IF NOT EXISTS contact_requests (
    id SERIAL PRIMARY KEY,
    requester_id INTEGER REFERENCES users(id) ON DELETE CASCADE, -- Doit être Premium
    idea_id INTEGER REFERENCES genesis_ideas(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'declined'
    message TEXT, -- Message d'introduction du Premium au créateur
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(requester_id, idea_id)
);

-- ==========================================
-- TRAÇABILITÉ ET LOGIQUE
-- ==========================================

ALTER TABLE events 
ADD CONSTRAINT fk_featured_idea 
FOREIGN KEY (featured_idea_id) REFERENCES genesis_ideas(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    idea_id INTEGER REFERENCES genesis_ideas(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action_type VARCHAR(50) NOT NULL, -- 'view', 'socrate_activation', 'premium_purchase', 'contact_request'
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_genesis_is_socrate ON genesis_ideas(is_socrate);
CREATE INDEX idx_users_premium_expiry ON users(premium_until);
CREATE INDEX idx_contact_requests_status ON contact_requests(status);

-- Trigger pour mise à jour automatique de la date de modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_genesis_modtime
    BEFORE UPDATE ON genesis_ideas
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- ==========================================
-- VUES SÉCURISÉES
-- ==========================================

-- Vue vérifiant le verrouillage Socrate
-- La description n'est jamais révélée si is_socrate est TRUE
CREATE VIEW v_public_genesis AS
SELECT 
    g.id,
    g.title,
    CASE 
        WHEN g.is_socrate = TRUE THEN NULL 
        ELSE g.description 
    END AS description,
    g.is_socrate,
    g.genre,
    g.platform,
    e.title AS event_name,
    g.created_at
FROM genesis_ideas g
LEFT JOIN events e ON g.event_id = e.id;