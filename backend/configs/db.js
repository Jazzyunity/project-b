const { Pool } = require('pg');
const Config = require('./config');
require('dotenv').config();

// En prod, on utilise la String complète. En local, on peut garder les variables séparées si on veut.
const connectionString = Config.db.url;

const pool = new Pool({
    connectionString: connectionString,
    // SÉCURITÉ : Indispensable pour Supabase/Render
    ssl: { rejectUnauthorized: false } 
});

pool.on('error', (err, client) => {
    console.error('Erreur inattendue sur le client PostgreSQL', err);
    process.exit(-1);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};