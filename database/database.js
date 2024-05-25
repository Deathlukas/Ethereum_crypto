const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

class DatabaseSingleton {
    constructor() {
        if (!DatabaseSingleton.instance) {
            this.pool = new Pool({
                user: process.env.DB_USER,
                host: process.env.DB_HOST,
                database: process.env.DB_NAME,
                password: process.env.DB_PASSWORD.toString(),
                port: process.env.DB_PORT
            });

            DatabaseSingleton.instance = this;
        }
        return DatabaseSingleton.instance;
    }

    async connectToDatabase() {
        try {
            const client = await this.pool.connect();
            return client;
        } catch (err) {
            console.error('Error connecting to database:', err);
            throw err;
        }
    }
}

const instance = new DatabaseSingleton();
Object.freeze(instance);

module.exports = instance;