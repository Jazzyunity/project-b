const db = require('../configs/db');

class GameIdea {

    // Récupérer toutes les idées (triées par date de création)
    static async findAll() {
        const result = await db.query('SELECT * FROM game_ideas ORDER BY created_at DESC');
        return result.rows;
    }

    // Récupérer une idée par son ID
    static async findById(id) {
        const result = await db.query('SELECT * FROM game_ideas WHERE id = $1', [id]);
        return result.rows[0];
    }

    // Créer une nouvelle idée (Sécurisé contre injection SQL)
    static async create(data) {
        const {
            title, pitch, core_mechanics, story_summary,
            project_scale, genre, target_audience, game_engine, estimated_budget
        } = data;

        const query = `
            INSERT INTO game_ideas (
                title, pitch, core_mechanics, story_summary, 
                project_scale, genre, target_audience, game_engine, estimated_budget
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *;
        `;

        const values = [
            title, pitch, core_mechanics, story_summary,
            project_scale, genre, target_audience, game_engine, estimated_budget
        ];

        const result = await db.query(query, values);
        return result.rows[0];
    }

    // Mettre à jour le statut (ex: passer de "Concept" à "Prototypage")
    static async updateStatus(id, newStatus) {
        const query = 'UPDATE game_ideas SET status = $1 WHERE id = $2 RETURNING *';
        const result = await db.query(query, [newStatus, id]);
        return result.rows[0];
    }

    // Supprimer une idée
    static async delete(id) {
        await db.query('DELETE FROM game_ideas WHERE id = $1', [id]);
        return true;
    }
}

module.exports = GameIdea;