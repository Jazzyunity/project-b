const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Config = require('../configs/config');

// Générateur de Token
const signToken = (id) => {
    return jwt.sign({ id }, Config.jwt.secret, { expiresIn: '1d' });
};

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Hachage du mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedBtn = await bcrypt.hash(password, salt);

        // Sauvegarde (Logique simplifiée pour l'exemple)
        // const newUser = await User.create({ username, email, password: hashedBtn });

        res.status(201).json({ status: 'success', message: "Utilisateur créé" });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    // 1. Vérifier si l'utilisateur existe
    const user = await User.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    // 2. Créer le Token
    const token = signToken(user.id);

    // 3. Envoyer le cookie
    res.cookie('token', token, Config.cookieSettings);

    res.status(200).json({ status: 'success', user: { id: user.id, username: user.username } });
};

exports.logout = (req, res) => {
    res.cookie('token', 'loggedout', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });
    res.status(200).json({ status: 'success' });
};

exports.getMe = async (req, res) => {
    // req.user est injecté par le middleware protect
    res.status(200).json({ status: 'success', data: req.user });
};