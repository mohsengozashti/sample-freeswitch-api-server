require('dotenv').config();
const http = require('http');
const createApp = require('./app');

const port = process.env.PORT || 3000;
const app = createApp();

const server = http.createServer(app);

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`FreeSWITCH XML API server listening on port ${port}`);
});
