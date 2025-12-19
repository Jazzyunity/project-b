require('dotenv').config();

const config = {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    appurl: process.env.APP_URL,
    db: {
        url: process.env.DB_URL,
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expires: process.env.JWT_EXPIRES_IN || '1d',
        expiresCookie: process.env.JWT_COOKIE_EXPIRES_IN || '1d',
    },
    // Logique spécifique pour les cookies
    cookieSettings: {
        httpOnly: true,
        // On n'active le "secure" (HTTPS) que si on est en production
        secure: process.env.NODE_ENV === 'production',
        // "none" pour le cross-site en prod, "lax" pour le local
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000
    }
};

module.exports = config;