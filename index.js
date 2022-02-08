 const peg = require("pegjs");
 const fs = require('fs');
 const { Factory} = require('winston-simple-wrapper')
 const WSCLINET = require('ws-reconnect');
 const config = require('config');
 const deserializer = peg.generate(fs.readFileSync(__dirname + '/protocol/tci-deserializer.pegjs').toString());
 const mqtt = require('mqtt')
 const serializer = require("./protocol/tci-serializer");

 const Readable = require('stream').Readable
 const bufferAlloc = require('buffer-alloc')
 const Speaker  = require('speaker-arm64');

const WebSocketServer = require("ws").Server;
const wss = new WebSocketServer({ port: 8080 });

var trxState = {
  ready: false
};

const log = new Factory({
  transports: config.get("log")
})


const wsClient = new WSCLINET(config.get("SDR").tci, {
  retryCount: 1000,
  reconnectInterval: 5
}).on("reconnect", () => {
  log.warn("Reconnecting...", "WS");
}).on('connect', () => {
  log.info('Connected to: ' + config.get("SDR").tci, "WS");
  trxState = {
      ready: false
  };
}).on('message', handleIncomingWsMessage);

wss.on('connection', function connection(ws) {
  ws.on('message', function message(data) {
    console.log('received: %s', data);
  });

  ws.send('something');
});

function handleIncomingWsMessage(message) {
  log.silly("Received: '" + message + "'", "RAW");
}

async function start() {
  log.info("Starting up.");
  wsClient.start();
}

start();
