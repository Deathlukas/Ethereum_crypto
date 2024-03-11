const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

(async () => {
    try {
        const client = await pool.connect();
        console.log('Connected to database');
        client.release();
    } catch (err) {
        console.error('Error connecting to database:', err);
    }
})();