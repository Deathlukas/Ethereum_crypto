const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');


const app = express();
const socket = new WebSocket('wss://ws.finnhub.io?token=cnhhfupr01qhlslj333gcnhhfupr01qhlslj3340');

let price;

// Connection opened -> Subscribe
socket.addEventListener('open', function (event) {
    socket.send(JSON.stringify({'type':'subscribe', 'symbol': 'BINANCE:ETHUSDT'}))
});

// Listen for messages
socket.addEventListener('message', function (event) {
    var data = JSON.parse(event.data);
    if (data.data && data.data.length > 0) {
        price = data.data[0].p; // Update the price variable
        console.log(price); // This get the price of the ethereum from the JSON data.
    } else {
        console.log('Unexpected message structure:', data);
    }
});
app.get('/price', (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    if (price) {
        res.send({price: price}); // Send the price to the client
    } else {
        res.status(500).send({error: 'Price not available yet'});
    }
});

// Unsubscribe
 var unsubscribe = function(symbol) {
    socket.send(JSON.stringify({'type':'unsubscribe','symbol': symbol}))
}


app.use(cors());
app.use(express.json());

app.get('/message', (req, res) => {
    res.send('Does this work?');
});

app.listen(8000, () => {
    console.log('Server is running on port 8000');
});