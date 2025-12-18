const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    const token = req.cookies.token; // Récupère le token du cookie

    if (!token) return res.status(401).json({ message: "Accès refusé. Connectez-vous." });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Ajoute l'ID de l'utilisateur à la requête
        next();
    } catch (err) {
        res.status(401).json({ message: "Token invalide" });
    }
};

module.exports = { protect };