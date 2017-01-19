const http = require('http')
const express = require('express')
const ShareDB = require('sharedb')
const Logger = require('sharedb-logger')
const db = require('sharedb-mongo')('mongodb://localhost:27017/data')
const richText = require('rich-text')
const WebSocket = require('ws')
const WebSocketJSONStream = require('websocket-json-stream')
const bodyParser = require('body-parser')

ShareDB.types.register(richText.type)
const backend = new ShareDB({db})
const logger = new Logger(backend)
startServer()

function startServer() {
  const app = express();
  app.use(express.static(__dirname + '/../client'));
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: false }))
  const router = require('./routes')(app, express)
  app.use('/', router)

  const server = http.createServer(app);

  // Connects any incoming WebSocket connection to ShareDB
  let wss = new WebSocket.Server({server: server});
  wss.on('connection', function(ws, req) {
    let stream = new WebSocketJSONStream(ws)
    backend.listen(stream)
  })

  server.listen(3000)
  console.log('Listening on 3K')
}
