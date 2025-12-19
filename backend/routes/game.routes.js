const express = require('express');
const router = express.Router();
const GameIdea = require('../models/GameIdea');
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');

const gameController = require('../controllers/gameController');

/**
 * PROTECTION GLOBALE
 * Toutes les routes définies dans ce fichier passent désormais par le middleware protect.
 * Si l'utilisateur n'est pas connecté, il recevra une erreur 401.
 */
router.use(protect);

// 1. LISTE : Tout le monde voit, mais le contrôleur filtrera les données (voir plus bas)
router.get('/all', gameController.listAll);

// 2. DÉTAIL : Réservé aux Premium et Admins
router.get('/detail/:id', restrictTo('premium', 'admin'), gameController.getDetail);

// 3. CRÉATION : Tout le monde peut créer (user, premium, admin)
router.post('/submit-new', gameController.createIdea);

// 4. PRENDRE LE CONTRÔLE : Réservé aux Premium
router.patch('/take-control/:id', restrictTo('premium'), gameController.takeControl);

module.exports = router;