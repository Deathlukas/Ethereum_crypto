const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD.toString(),
    port: process.env.DB_PORT
});

const connectToDatabase = async () => {
    try {
        const client = await pool.connect();
        console.log('Connected to database');
        return client;
    } catch (err) {
        console.error('Error connecting to database:', err);
        throw err; 
    }
};

module.exports = { pool, connectToDatabase };