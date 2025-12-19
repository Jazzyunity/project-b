const router = require('express').Router();
const authCtrl = require('../controllers/authController');
const { protect } = require('../middlewares/auth.middleware');

// Routes Publiques
router.post('/register', authCtrl.register);
router.post('/login', authCtrl.login);

// Routes Protégées (nécessite d'être connecté)
router.get('/logout', protect, authCtrl.logout);
router.get('/me', protect, authCtrl.getMe); // Pour récupérer les infos du profil en JS

module.exports = router;