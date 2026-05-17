require('dotenv').config();

const http = require('http');

const app = require('./app');

const {
  initializeSocket
} = require('./socket/socket');

const PORT =
  process.env.PORT || 5050;

const server =
  http.createServer(app);

initializeSocket(server);

server.listen(PORT, () => {

  console.log(`
BioSentinel-AI 1.0 Face Scan Running
PORT: ${PORT}
  `);

}); 