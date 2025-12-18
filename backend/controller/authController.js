const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // 1. Hachage du mot de passe (Salt round = 10)
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 2. Insertion en base
        const newUser = await db.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
            [username, email, hashedPassword]
        );

        res.status(201).json({ status: 'success', data: newUser.rows[0] });
    } catch (err) {
        res.status(400).json({ status: 'error', message: "L'email existe déjà." });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    // 1. Trouver l'utilisateur
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) return res.status(401).json({ message: "Identifiants incorrects" });

    // 2. Comparer les mots de passe
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ message: "Identifiants incorrects" });

    // 3. Créer le Token JWT
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });

    // 4. Envoyer via un Cookie sécurisé (Norme de sécurité 2025)
    res.cookie('token', token, {
        httpOnly: true, // Empêche l'accès via JavaScript (protection XSS)
        secure: process.env.NODE_ENV === 'production', // Uniquement via HTTPS
        sameSite: 'strict', // Protection CSRF
        maxAge: 24 * 60 * 60 * 1000 // 24 heures
    });

    res.json({ status: 'success', message: "Connecté !" });
};