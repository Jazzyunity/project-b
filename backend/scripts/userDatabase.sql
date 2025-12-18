-- S'assurer que l'extension UUID est activée
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Création de la table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    
    -- Système de rôles avec contrainte de vérification
    role VARCHAR(20) NOT NULL DEFAULT 'user' 
        CHECK (role IN ('admin', 'premium', 'user')),
    
    -- Dates de suivi
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Index pour accélérer les recherches par email lors du login
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);