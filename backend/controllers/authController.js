const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

/**
 * INSCRIPTION (Register)
 * Règle : Par défaut, un nouvel inscrit est 'user'. 
 * L'admin peut être créé manuellement en base de données pour plus de sécurité.
 */
exports.register = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // 1. Validation de base
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Tous les champs sont obligatoires." });
        }

        // 2. Sécurité : On force le rôle à 'user' sauf si on veut permettre 
        // l'achat d'un abonnement premium dès l'inscription.
        // Ici, on accepte le rôle envoyé (pour tes tests) mais on pourrait le brider.
        const userRole = role || 'user';

        // 3. Hachage du mot de passe
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 4. Insertion en base
        const query = `
            INSERT INTO users (username, email, password_hash, role) 
            VALUES ($1, $2, $3, $4) 
            RETURNING id, username, email, role;
        `;
        const values = [username, email, hashedPassword, userRole];

        const result = await db.query(query, values);

        res.status(201).json({
            status: 'success',
            message: "Compte créé avec succès.",
            data: result.rows[0]
        });

    } catch (err) {
        if (err.code === '23505') { // Code d'erreur PostgreSQL pour doublon (Unique constraint)
            return res.status(400).json({ message: "Cet email est déjà utilisé." });
        }
        res.status(500).json({ status: 'error', message: err.message });
    }
};

/**
 * CONNEXION (Login)
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Chercher l'utilisateur
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect." });
        }

        // 2. Vérifier le mot de passe avec Bcrypt
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect." });
        }

        // 3. Créer le Token JWT (inclure le rôle pour le middleware protect)
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // 4. Envoyer le cookie HttpOnly
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Uniquement HTTPS en prod
            sameSite: 'Strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 heures
        });

        // 5. Réponse sans le mot de passe
        res.status(200).json({
            status: 'success',
            message: "Connexion réussie.",
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });

    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

/**
 * DÉCONNEXION (Logout)
 */
exports.logout = (req, res) => {
    // On efface le cookie en lui donnant une date d'expiration passée
    res.cookie('token', '', { expires: new Date(0), httpOnly: true });
    res.status(200).json({ status: 'success', message: "Déconnecté." });
};