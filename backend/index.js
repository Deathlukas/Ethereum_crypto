const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const app = express();
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

const socket = new WebSocket('wss://ws.finnhub.io?token=cnhhfupr01qhlslj333gcnhhfupr01qhlslj3340');

socket.addEventListener('open', function (event) {
    socket.send(JSON.stringify({'type':'subscribe', 'symbol': 'BINANCE:ETHUSDT'}))
});

socket.addEventListener('message', async function (event) {
    var data = JSON.parse(event.data);
    if (data.data && data.data.length > 0) {
        const price = data.data[0].p;
        const timestamp = new Date(data.data[0].t * 1000);
        const volume = data.data[0].v;

        try {
            const client = await pool.connect();
            const queryText = 'INSERT INTO websocket_data (symbol, price, timestamp, volume) VALUES ($1, $2, $3, $4)';
            const values = ['BINANCE:ETHUSDT', price, timestamp, volume];
            await client.query(queryText, values);
            client.release();
            console.log('Data inserted into the database');
        } catch (err) {
            console.error('Error inserting data into database:', err);
        }
    } else {
        console.log('Unexpected message structure:', data);
    }
});

app.use(cors());

// Endpoint to fetch price from the database
app.get('/price', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT price FROM websocket_data ORDER BY timestamp DESC LIMIT 1');
        client.release();
        res.json({ price: result.rows[0].price });
    } catch (err) {
        console.error('Error fetching price:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to fetch volume from the database
app.get('/volume', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT volume FROM websocket_data ORDER BY timestamp DESC LIMIT 1');
        client.release();
        res.json({ volume: result.rows[0].volume });
    } catch (err) {
        console.error('Error fetching volume:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to fetch timestamp from the database
app.get('/timestamp', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT timestamp FROM websocket_data ORDER BY timestamp DESC LIMIT 1');
        client.release();
        res.json({ timestamp: result.rows[0].timestamp });
    } catch (err) {
        console.error('Error fetching timestamp:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.use(express.json());

app.get('/message', (req, res) => {
    res.send('Does this work?');
});

app.listen(8000, () => {
    console.log('Server is running on port 8000');
});