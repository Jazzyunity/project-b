const express = require('express');
const router = express.Router();
const path = require('path');

// Dossier où se trouvent vos fichiers HTML
const publicPath = path.join(__dirname, '../../frontend/public');

router.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

router.get('/submit', (req, res) => {
    res.sendFile(path.join(publicPath, 'submit.html'));
});

router.get('/login', (req, res) => {
    res.sendFile(path.join(publicPath, 'login.html'));
});

module.exports = router;