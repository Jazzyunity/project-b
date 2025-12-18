const db = require('../config/db');

class Event {
    // Récupérer un événement avec TOUS les jeux qui y participent
    static async findById(id) {
        const res = await db.query('SELECT * FROM events WHERE id = $1', [id]);
        return res.rows[0];
    }

    static async create(data) {
        const { title, theme, description, start_date, end_date } = data;
        const res = await db.query(
            'INSERT INTO events (title, theme, description, start_date, end_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [title, theme, description, start_date, end_date]
        );
        return res.rows[0];
    }

    static async delete(id) {
        await db.query('DELETE FROM events WHERE id = $1', [id]);
        return true;
    }
}

module.exports = Event;