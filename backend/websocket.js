const WebSocket = require('ws');
const moment = require('moment-timezone');
const database = require('../database/database');

class WebSocketSingleton {
    constructor() {
        if (!WebSocketSingleton.instance) {
            this.socket = new WebSocket('wss://ws.finnhub.io?token=cnhhfupr01qhlslj333gcnhhfupr01qhlslj3340');

            this.socket.addEventListener('open', (event) => {
                this.socket.send(JSON.stringify({ 'type': 'subscribe', 'symbol': 'BINANCE:ETHUSDT' }));
            });

            this.socket.addEventListener('message', async (event) => {
                const data = JSON.parse(event.data);
                if (data.data && data.data.length > 0) {
                    const timestampLocal = moment().tz('Europe/Copenhagen');
                    const formattedDate = timestampLocal.format('DD,MM,YYYY');
                    const formattedTime = timestampLocal.format('HH:mm:ss');

                    for (const datapoint of data.data) {
                        const price = datapoint.p;
                        const volume = datapoint.v;

                        try {
                            const client = await database.connectToDatabase();
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

            WebSocketSingleton.instance = this;
        }
        return WebSocketSingleton.instance;
    }

    getSocket() {
        return this.socket;
    }
}

const instance = new WebSocketSingleton();
Object.freeze(instance);

module.exports = instance;