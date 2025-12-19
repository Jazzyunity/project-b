const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');

const eventController = require('../controllers/eventController');

// --- ROUTES PUBLIQUES (Consultation) ---

router.use(protect); // Tout le monde doit être connecté

// Consultation
router.get('/all', eventController.listAll);
router.get('/:id', eventController.getDetail);

// Création/Suppression : RÉSERVÉ AUX ADMINS
router.post('/create', restrictTo('admin'), eventController.create);
router.delete('/remove/:id', restrictTo('admin'), eventController.remove);

module.exports = router;