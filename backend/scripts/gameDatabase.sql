-- Active l'extension pour générer des IDs uniques et sécurisés (UUID)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Création de la table des idées de jeux
CREATE TABLE IF NOT EXISTS game_ideas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    
    -- Le Pitch : court résumé accrocheur (Elevator Pitch)
    pitch TEXT,
    
    -- Détails profonds
    core_mechanics TEXT, -- Les mécaniques principales du jeu
    story_summary TEXT,  -- Résumé de l'histoire/lore
    
    -- Catégorisation technique
    project_scale VARCHAR(50) CHECK (project_scale IN ('AAA', 'II', 'Indie', 'Mobile', 'Hobby')),
    genre VARCHAR(100), -- Ex: RPG, FPS, RTS
    target_audience VARCHAR(50), -- Ex: PEGI 18, Tout public
    game_engine VARCHAR(50), -- Ex: Unreal Engine 5, Unity, Godot
    
    -- Gestion de projet
    estimated_budget NUMERIC(15, 2), -- Permet de stocker de gros montants avec centimes
    status VARCHAR(50) DEFAULT 'Concept' CHECK (status IN ('Concept', 'Prototypage', 'Production', 'Annulé', 'Publié')),
    
    -- Dates de suivi
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Fonction pour mettre à jour automatiquement la date updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger qui déclenche la fonction ci-dessus avant chaque UPDATE
DROP TRIGGER IF EXISTS update_game_ideas_modtime ON game_ideas;
CREATE TRIGGER update_game_ideas_modtime
    BEFORE UPDATE ON game_ideas
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();