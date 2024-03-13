const WebSocket = require('ws');

const socket = new WebSocket('wss://ws.finnhub.io?token=cnhhfupr01qhlslj333gcnhhfupr01qhlslj3340');

// Connection opened -> Subscribe
socket.addEventListener('open', function (event) {
    socket.send(JSON.stringify({'type':'subscribe', 'symbol': 'BINANCE:ETHUSDT'}))
});

// Listen for messages
socket.addEventListener('message', function (event) {
    console.log('Message from server ', event.data);
    var data = JSON.parse(event.data);
    console.log(data);
    console.log(data.data[0].p); // This get the price of the ethereum from the JSON data.
});

// Unsubscribe
 var unsubscribe = function(symbol) {
    socket.send(JSON.stringify({'type':'unsubscribe','symbol': symbol}))
}
