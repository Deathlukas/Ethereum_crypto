const express = require('express');
const cors = require('cors');
const moment = require('moment-timezone');
const database = require('../database/database');
const websocket = require('./websocket');

const app = express();
const socket = websocket.getSocket();

const insertDataIntoDatabase = async (price, volume) => {
    try {
        const timestampLocal = moment().tz('Europe/Copenhagen');
        const formattedDateTime = timestampLocal.format('DD,MM,YYYY HH:mm:ss');
        const client = await database.connectToDatabase();
        const queryText = 'INSERT INTO websocket_data (symbol, price, timestamp, volume) VALUES ($1, $2, $3, $4)';
        const values = ['BINANCE:ETHUSDT', price, formattedDateTime, volume];
        await client.query(queryText, values);
        client.release();
        console.log('Data fetched and updated in the database');
    } catch (error) {
        console.error('Error inserting data into database:', error);
    }
};

const fetchDataAndUpdateDatabase = async () => {
    try {
        const data = await new Promise((resolve, reject) => {
            socket.once('message', (event) => {
                if (event.type === 'trade') {
                    resolve(JSON.parse(event.data));
                } else {
                    if (event.type === 'ping') {
                        socket.send('pong');
                    }
                    reject('Unexpected message structure:', event);
                }
            });
        });

        if (data.data && data.data.length > 0) {
            for (const datapoint of data.data) {
                const { p: price, v: volume } = datapoint;
                insertDataIntoDatabase(price, volume);
            }
        } else {
            console.log('Unexpected message structure:', data);
        }
    } catch (error) {
        console.error('Error fetching data and updating database:', error);
    }
};


setInterval(fetchDataAndUpdateDatabase, 300000);

app.use(cors());
app.use(express.json());

app.get('/price', async (req, res) => {
    try {
        const client = await database.connectToDatabase();
        const result = await client.query('SELECT price FROM websocket_data ORDER BY timestamp DESC LIMIT 1');
        client.release();
        console.log("Price:", result.rows[0].price);
        res.json({ price: result.rows[0].price });
    } catch (error) {
        console.error('Error fetching price:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/volume', async (req, res) => {
    try {
        const client = await database.connectToDatabase();
        const result = await client.query('SELECT volume FROM websocket_data ORDER BY timestamp DESC LIMIT 1');
        client.release();
        console.log("Volume:", result.rows[0].volume);
        res.json({ volume: result.rows[0].volume });
    } catch (error) {
        console.error('Error fetching volume:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/timestamp', async (req, res) => {
    try {
        const client = await database.connectToDatabase();
        const result = await client.query('SELECT timestamp FROM websocket_data ORDER BY timestamp DESC LIMIT 1');
        client.release();
        const timestamp = result.rows[0].timestamp;
        const formattedTimestamp = moment(timestamp).format('DD,MM,YYYY HH:mm:ss');
        console.log("Timestamp:", formattedTimestamp);
        res.json({ timestamp: formattedTimestamp });
    } catch (error) {
        console.error('Error fetching timestamp:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/alldata', async (req, res) => {
    try {
        const client = await database.connectToDatabase();
        const result = await client.query('SELECT price, timestamp FROM websocket_data ORDER BY timestamp DESC');
        client.release();
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching all data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/message', (req, res) => {
    res.send('Does this work?');
});


const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});