const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const GameIdea = require('../models/GameIdea');


router.use(protect);

// --- ROUTE : RÉCUPÉRER TOUTES LES IDÉES ---
// GET /api/v1/games/all
router.get('/games/all', async (req, res) => {
    try {
        const games = await GameIdea.findAll();
        res.status(200).json({
            status: 'success',
            results: games.length,
            data: games
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// --- ROUTE : RÉCUPÉRER UNE IDÉE PAR ID ---
// GET /api/v1/games/detail/:id
router.get('/games/detail/:id', async (req, res) => {
    try {
        const game = await GameIdea.findById(req.params.id);
        if (!game) {
            return res.status(404).json({ status: 'fail', message: 'Idée non trouvée' });
        }
        res.status(200).json({ status: 'success', data: game });
    } catch (err) {
        res.status(500).json({ status: 'error', message: 'Format ID invalide' });
    }
});

// --- ROUTE : CRÉATION (Route spécifique dédiée) ---
// POST /api/v1/games/submit-new
router.post('/games/submit-new', async (req, res) => {
    try {
        // Sécurité : Vous pourriez ajouter ici un middleware de validation
        const newGame = await GameIdea.create(req.body);
        res.status(201).json({
            status: 'success',
            message: 'Idée de jeu enregistrée avec succès',
            data: newGame
        });
    } catch (err) {
        res.status(400).json({ status: 'error', message: 'Données invalides ou manquantes' });
    }
});

// --- ROUTE : SUPPRESSION ---
// DELETE /api/v1/games/remove/:id
router.delete('/games/remove/:id', async (req, res) => {
    try {
        const game = await GameIdea.findById(req.params.id);
        if (!game) {
            return res.status(404).json({ status: 'fail', message: 'Cette idée n\'existe pas' });
        }
        
        await GameIdea.delete(req.params.id);
        res.status(200).json({
            status: 'success',
            message: `L'idée "${game.title}" a été supprimée.`
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

module.exports = router;