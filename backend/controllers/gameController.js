const GameIdea = require('../models/GameIdea');
const db = require('../configs/db');

/**
 * LISTER TOUS LES JEUX
 * Règle : 'user' voit uniquement les titres, 'premium'/'admin' voient tout.
 */
exports.listAll = async (req, res) => {
    try {
        const userRole = req.user.role;
        let query;

        if (userRole === 'user') {
            // Filtrage strict : on ne sélectionne que les colonnes publiques
            query = 'SELECT id, title, created_at, event_id, taken_by FROM game_ideas ORDER BY created_at DESC';
        } else {
            // Accès complet pour les abonnés et admins
            query = 'SELECT * FROM game_ideas ORDER BY created_at DESC';
        }

        const result = await db.query(query);
        res.status(200).json({ status: 'success', data: result.rows });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

/**
 * DÉTAIL D'UN JEU
 * Règle : Bloqué pour les 'user' (le router utilise déjà restrictTo('premium', 'admin'))
 */
exports.getDetail = async (req, res) => {
    try {
        const game = await GameIdea.findById(req.params.id);
        if (!game) {
            return res.status(404).json({ status: 'fail', message: "Idée introuvable" });
        }
        res.status(200).json({ status: 'success', data: game });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

/**
 * CRÉER UNE IDÉE
 * Accessible à tous les connectés.
 */
exports.createIdea = async (req, res) => {
    try {
        const { title, pitch, core_mechanics, story_summary, project_scale, genre, game_engine, estimated_budget, event_id } = req.body;

        const newGame = await GameIdea.create({
            title,
            pitch,
            core_mechanics,
            story_summary,
            project_scale,
            genre,
            game_engine,
            estimated_budget,
            event_id,
            author_id: req.user.id // ID récupéré du token JWT
        });

        res.status(201).json({ status: 'success', data: newGame });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
};

/**
 * PRENDRE LE CONTRÔLE D'UNE IDÉE (Take Control)
 * Règle : Réservé aux 'premium'. Une idée ne peut être prise qu'une seule fois.
 */
exports.takeControl = async (req, res) => {
    const client = await db.pool.connect(); // Utilisation d'un client pour une transaction
    try {
        const gameId = req.params.id;
        const userId = req.user.id;

        await client.query('BEGIN');

        // 1. Vérifier si le jeu existe et n'est pas déjà pris
        const checkQuery = 'SELECT taken_by, title FROM game_ideas WHERE id = $1 FOR UPDATE';
        const checkRes = await client.query(checkQuery, [gameId]);

        if (checkRes.rows.length === 0) {
            throw new Error("Jeu introuvable.");
        }

        if (checkRes.rows[0].taken_by) {
            return res.status(400).json({ 
                status: 'fail', 
                message: "Cette idée a déjà été adoptée par un autre studio/membre Premium." 
            });
        }

        // 2. Mettre à jour le champ taken_by
        const updateQuery = 'UPDATE game_ideas SET taken_by = $1, status = $2 WHERE id = $3 RETURNING *';
        const result = await client.query(updateQuery, [userId, 'Production', gameId]);

        await client.query('COMMIT');

        res.status(200).json({
            status: 'success',
            message: `Félicitations ! Vous avez pris le contrôle de "${checkRes.rows[0].title}".`,
            data: result.rows[0]
        });

    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ status: 'error', message: err.message });
    } finally {
        client.release();
    }
};

/**
 * SUPPRIMER UNE IDÉE
 * Seul l'admin ou l'auteur original (optionnel) peut supprimer.
 */
exports.deleteIdea = async (req, res) => {
    try {
        // Logique simplifiée : ici on fait confiance au router (restrictTo admin)
        await GameIdea.delete(req.params.id);
        res.status(200).json({ status: 'success', message: "Idée supprimée." });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};