const express = require('express');
const router = express.Router();

// Exemple de route API
router.get('/status', (req, res) => {
    res.status(200).json({ status: 'success', message: 'API opérationnelle' });
});

// Route pour traiter un formulaire de contact
router.post('/contact', (req, res) => {
    const { email, message } = req.body;
    // Ici, vous ajouteriez la validation (ex: avec express-validator)
    console.log(`Message reçu de ${email}`);
    res.status(201).json({ message: 'Message bien reçu !' });
});

module.exports = router;