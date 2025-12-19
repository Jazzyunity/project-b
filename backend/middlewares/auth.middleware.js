const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Config = require('../configs/config');

exports.protect = async (req, res, next) => {
    let token;

    // Récupérer le token depuis les cookies
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return res.status(401).json({ message: "Vous n'êtes pas connecté." });
    }

    try {
        // Vérifier le token
        const decoded = jwt.verify(token, Config.jwt.secret);

        // Vérifier si l'utilisateur existe encore
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) return res.status(401).json({ message: "L'utilisateur n'existe plus." });

        // AJOUTER L'USER À LA REQUÊTE
        req.user = currentUser;
        next();
    } catch (err) {
        res.status(401).json({ message: "Token invalide." });
    }
};