const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const { Pool } = require('pg');
const moment = require('moment-timezone');
const { pool, connectToDatabase } = require('../database/database');

const app = express();

const socket = new WebSocket('wss://ws.finnhub.io?token=cnhhfupr01qhlslj333gcnhhfupr01qhlslj3340');

socket.addEventListener('open', function (event) {
    socket.send(JSON.stringify({'type':'subscribe', 'symbol': 'BINANCE:ETHUSDT'}))
});

socket.addEventListener('message', async function (event) {
    var data = JSON.parse(event.data);
    if (data.data && data.data.length > 0) {
        const timestampLocal = moment().tz('Europe/Copenhagen');
        const formattedDate = timestampLocal.format('DD,MM,YYYY'); 
        const formattedTime = timestampLocal.format('HH:mm:ss'); 

        for (const datapoint of data.data) {
            const price = datapoint.p;
            const volume = datapoint.v;

            try {
                const client = await pool.connect();
                const queryText = 'INSERT INTO websocket_data (symbol, price, timestamp, volume) VALUES ($1, $2, $3, $4)';
                const values = ['BINANCE:ETHUSDT', price, `${formattedDate} ${formattedTime}`, volume];
                await client.query(queryText, values);
                client.release();
            } catch (err) {
                console.error('Error inserting data into database:', err);
            }
        }
    } else {
        console.log('Unexpected message structure:', data);
    }
});


const fetchDataAndUpdateDatabase = async () => {
    try {
        socket.addEventListener('message', async function (event) {
            var data = JSON.parse(event.data);
            if (data.data && data.data.length > 0) {
                const timestampLocal = moment().tz('Europe/Copenhagen');
                const formattedDate = timestampLocal.format('DD,MM,YYYY');
                const formattedTime = timestampLocal.format('HH:mm:ss');

                for (const datapoint of data.data) {
                    const price = datapoint.p;
                    const volume = datapoint.v;
                    const client = await pool.connect();
                    const queryText = 'INSERT INTO websocket_data (symbol, price, timestamp, volume) VALUES ($1, $2, $3, $4)';
                    const values = ['BINANCE:ETHUSDT', price, `${formattedDate} ${formattedTime}`, volume];
                    await client.query(queryText, values);
                    client.release();
                }

                console.log('Data fetched and updated in the database');
            } else {
                console.log('Unexpected message structure:', data);
            }
        });
    } catch (error) {
        console.error('Error fetching data and updating database:', error);
    }
};

fetchDataAndUpdateDatabase();
setInterval(fetchDataAndUpdateDatabase, 30000); 

app.use(cors());


app.get('/price', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT price FROM websocket_data ORDER BY timestamp DESC LIMIT 1');
        client.release();
        console.log("Price:", result.rows[0].price); 
        res.json({ price: result.rows[0].price });
    } catch (err) {
        console.error('Error fetching price:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.get('/volume', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT volume FROM websocket_data ORDER BY timestamp DESC LIMIT 1');
        client.release();
        console.log("Volume:", result.rows[0].volume);
        res.json({ volume: result.rows[0].volume });
    } catch (err) {
        console.error('Error fetching volume:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/timestamp', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT timestamp FROM websocket_data ORDER BY timestamp DESC LIMIT 1');
        client.release();

        const timestamp = result.rows[0].timestamp;

        const formattedTimestamp = moment(timestamp).format('DD,MM,YYYY HH:mm:ss');

        console.log("Timestamp:", formattedTimestamp);

        res.json({ timestamp: formattedTimestamp });
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