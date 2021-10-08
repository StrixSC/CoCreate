#!/usr/bin/env node

import Debug from 'debug';
import http from 'http';
import { app } from '../app';
import { Server, Socket } from 'socket.io';
import corsOptions from '../cors';
import { initDB, initializeCache } from '../db';

// Events
import chatHandler from '../events/chatHandler';
import { usernameCheck } from '../middlewares/usernameCheck';

export const normalizePort = (val: string) => {
  const port = parseInt(val, 10);
  if (Number.isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};

const debug = Debug('Colorimage API');
const port = normalizePort(process.env.PORT || '3000');
const server = http.createServer(app);


const onError = (error: any) => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const onListening = () => {
  const addr = server.address();
  const bind =
    typeof addr === 'string'
      ? `pipe ${addr}`
      : `port ${addr ? addr.port : 'ERR: Address is null'}`;
  debug(`Listening on ${bind}`);
};

const io = new Server(server, {
  cors: corsOptions,
});

const onConnection = (socket: Socket) => {
  chatHandler(io, socket);
  socket.on('connect_error', (err: any) => {
    console.log(`connect_error due to ${err.message}`);
  });
};

initDB().then(() => {
  const redisPort = Number(process.env.CACHE_REDIS_PORT || '3003');
  initializeCache(redisPort);
  io.use(usernameCheck);
  io.on('connection', onConnection);

  server.listen(port);
  server.on('error', onError);
  server.on('listening', onListening);
})
.catch((e) => {
  console.error(e);
});

export { io };