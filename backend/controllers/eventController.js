const Event = require('../models/Event');
const db = require('../configs/db');

/**
 * LISTER TOUS LES ÉVÉNEMENTS
 * Accessible par tous les utilisateurs connectés
 */
exports.listAll = async (req, res) => {
    try {
        const events = await Event.findAll();
        res.status(200).json({
            status: 'success',
            data: events
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

/**
 * DÉTAIL D'UN ÉVÉNEMENT + FILTRAGE DES JEUX SELON LE RÔLE
 * C'est ici qu'on applique ta règle : l'utilisateur normal ne voit que les titres.
 */
exports.getDetail = async (req, res) => {
    try {
        const eventId = req.params.id;
        const userRole = req.user.role;

        // 1. Récupérer les infos de l'événement
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ status: 'fail', message: "Événement introuvable" });
        }

        // 2. Récupérer les jeux liés en fonction du rôle
        let gamesQuery;
        if (userRole === 'user') {
            // Utilisateur normal : ne voit que les titres
            gamesQuery = 'SELECT id, title, created_at FROM game_ideas WHERE event_id = $1';
        } else {
            // Premium ou Admin : voit tout (pitch, mécaniques, etc.)
            gamesQuery = 'SELECT * FROM game_ideas WHERE event_id = $1';
        }

        const gamesResult = await db.query(gamesQuery, [eventId]);
        
        // 3. Fusionner les données
        const result = {
            ...event,
            games: gamesResult.rows
        };

        res.status(200).json({ status: 'success', data: result });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

/**
 * CRÉER UN ÉVÉNEMENT
 * (Protégé par le middleware restrictTo('admin'))
 */
exports.create = async (req, res) => {
    try {
        const { title, theme, description, start_date, end_date } = req.body;

        // Vérification des dates
        if (new Date(start_date) >= new Date(end_date)) {
            return res.status(400).json({ 
                status: 'fail', 
                message: "La date de fin doit être après la date de début." 
            });
        }

        const newEvent = await Event.create({
            title,
            theme,
            description,
            start_date,
            end_date
        });

        res.status(201).json({
            status: 'success',
            message: "Événement créé avec succès",
            data: newEvent
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

/**
 * SUPPRIMER UN ÉVÉNEMENT
 * (Protégé par le middleware restrictTo('admin'))
 */
exports.remove = async (req, res) => {
    try {
        const eventId = req.params.id;

        // On vérifie si des jeux sont liés avant de supprimer (optionnel selon ton besoin)
        const checkGames = await db.query('SELECT count(*) FROM game_ideas WHERE event_id = $1', [eventId]);
        
        if (parseInt(checkGames.rows[0].count) > 0) {
            // On peut soit bloquer, soit mettre à null (ici on informe)
            console.log(`Note: ${checkGames.rows[0].count} jeux seront détachés de cet événement.`);
        }

        await Event.delete(eventId);

        res.status(200).json({
            status: 'success',
            message: "Événement supprimé avec succès."
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};