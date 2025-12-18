const db = require('../config/db');

class User {
    /**
     * Trouver un utilisateur par son email (utilisé pour le login)
     */
    static async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await db.query(query, [email]);
        return result.rows[0];
    }

    /**
     * Trouver un utilisateur par son ID (utilisé par le middleware protect)
     */
    static async findById(id) {
        const query = 'SELECT id, username, email, role, created_at FROM users WHERE id = $1';
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    /**
     * Récupérer le profil complet (Infos + Mes idées + Idées contrôlées)
     */
    static async getFullProfile(userId) {
        const client = await db.pool.connect();
        try {
            // 1. Infos de base
            const userRes = await client.query(
                'SELECT id, username, email, role, created_at FROM users WHERE id = $1', 
                [userId]
            );
            const user = userRes.rows[0];

            if (!user) return null;

            // 2. Idées créées par cet utilisateur
            const createdGames = await client.query(
                'SELECT id, title, status FROM game_ideas WHERE author_id = $1',
                [userId]
            );

            // 3. Idées dont il a pris le contrôle (Premium seulement)
            const controlledGames = await client.query(
                'SELECT id, title, status FROM game_ideas WHERE taken_by = $1',
                [userId]
            );

            return {
                ...user,
                my_submissions: createdGames.rows,
                controlled_projects: controlledGames.rows
            };
        } finally {
            client.release();
        }
    }
}

module.exports = User;