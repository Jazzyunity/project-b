const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser')
require('dotenv').config();

const Config = require('./configs/config');

const app = express();

// --- SÉCURITÉ : CONFIGURATION DES MIDDLEWARES ---

// 1. Helmet : Configure les headers HTTP pour bloquer XSS, Clickjacking, etc.
// Note : On adapte la CSP pour autoriser les scripts locaux du dossier public.
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            "default-src": ["'self'"],
            // Autoriser les scripts de jsdelivr
            "script-src": ["'self'", "cdn.jsdelivr.net", "'unsafe-inline'"],
            // Autoriser les styles et les polices (icônes) de jsdelivr
            "style-src": ["'self'", "cdn.jsdelivr.net", "'unsafe-inline'"],
            "worker-src": ["'self'", "blob:"],
            "connect-src": ["'self'", "cdn.jsdelivr.net"],
            "font-src": ["'self'", "cdn.jsdelivr.net"],
            "img-src": ["'self'", "data:"],
        },
    },
}));

// 2. Rate Limiting : Protège contre les attaques par force brute (DoS)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // Fenêtre de 15 minutes
    max: 100, // Limite chaque IP à 100 requêtes par fenêtre
    message: "Trop de requêtes effectuées depuis cette IP, réessayez plus tard."
});
app.use('/api/', limiter); // On applique le limiteur uniquement sur les routes API

// 3. CORS : On n'autorise que notre propre domaine (sécurité essentielle)
app.use(cors({
    origin: Config.appurl || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// 4. Body Parser : Pour lire les données JSON et les formulaires
app.use(express.json({ limit: '10kb' })); // Limite la taille pour éviter le dépassement de mémoire
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// 5. Fichiers Statiques : On sert le CSS, Images et JS Client
app.use(express.static(path.join(__dirname, '../frontend/public')));

// --- ROUTAGE ---

// Import des routeurs
const viewRouter = require('./routes/view.routes');
const authRouter = require('./routes/auth.routes');
const gameRouter = require('./routes/game.routes');
const eventRouter = require('./routes/event.routes');
const config = require('./configs/config');

// Utilisation des routeurs
app.use('/', viewRouter);      // Pour servir les pages HTML
app.use('/api/v1/auth', authRouter); // Pour la logique de données (versionnée v1)
app.use('/api/v1/auth', gameRouter); // Pour la logique de données (versionnée v1)
app.use('/api/v1/auth', eventRouter); // Pour la logique de données (versionnée v1)

// --- GESTION D'ERREUR GLOBALE (Best Practice) ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Une erreur est survenue sur le serveur.');
});

// Lancement du serveur
const PORT = Config.port || 3000;
app.listen(PORT, () => {
    console.log(`[Server] Sécurisé et démarré sur http://localhost:${PORT}`);
});