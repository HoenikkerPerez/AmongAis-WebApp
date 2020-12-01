#!/usr/bin/env node
console.debug("Loading 'ws' module...");
const MODULES_FOLDER = 'C:\\Program Files\\nodejs\\node_modules\\npm\\node_modules\\'
//const MODULES_FOLDER = '/home/meek/.npm-global/lib/node_modules/';
const WebSocket = require(MODULES_FOLDER + 'ws');

const FAKE_CHANNEL = "tuscany";
const FAKE_NAME = "average-tuscan";
const SPAM_RATE = 5000;
console.debug("Message rate set to " + SPAM_RATE + "ms.");

console.debug("Opening WebSocket...");
const wss = new WebSocket.Server({ port: 8522 });
console.debug("WebSocket opened!");

// Random int generator from [min;max]

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //Il max è incluso e il min è incluso 
  }

// Interval

const responder = setInterval(() => {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) return ws.terminate();
    // Send a random big-data-mined average Tuscan debate message
    let random = getRandomIntInclusive(1,3);
    let msg;
    switch(random) {
        case 1:
            msg = "We invented the Italian language!";
            break;
        case 2:
            msg = "Viareggio is Lucca's seaside!";
            break;
        case 3:
            msg = "There's no Italy out of Tuscany!";
            break;
    }
    msg = FAKE_CHANNEL + " " + FAKE_NAME + " " + msg;
    //console.debug("Sending: " + msg);
    ws.send(msg);
  });
}, SPAM_RATE);

// Actual WebSocket logic

console.debug("Loading 'connection' callback...");

wss.on('connection', function connection(ws) {
  ws.isAlive = true;
  console.debug("A connection has been accepted!");
  console.debug("Loading 'message' callback...");
  ws.on('message', function incoming(message) {
    console.debug('Received message: %s', message);
  });

});

wss.on('close', function close() {
  // Dunno when this is executed.
  clearInterval(responder);
  console.debug("Boia! Connection closed.");
});

// Server is ready

console.debug("De! Accurate Tuscan Chat Server is now ready.");