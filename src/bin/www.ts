#!/usr/bin/env node
import 'reflect-metadata';
import http from 'http';
import { app, expressSession } from '../app';
import { Server, Socket } from 'socket.io';
import corsOptions from '../cors';
import passport from 'passport';
import { checkAuthenticated } from '../middlewares/auth.middleware';
import { handleSocketError } from './../utils/errors';

// Events
import chatHandler from '../events/chat.events';
import drawingHandler from '../events/drawing.events';
import channelHandler from '../events/channels.events';

import log from '../utils/logger';

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

const port = normalizePort(process.env.PORT || '3000');
const server = http.createServer(app);

const onError = (error: any) => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;
  switch (error.code) {
  case 'EACCES':
    log('CRITICAL', `${bind} requires elevated privileges`);
    process.exit(1);
  case 'EADDRINUSE':
    log('CRITICAL', `${bind} is already in use`);
    process.exit(1);
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

  log('INFO', `HTTP Server :: Listening on ${bind}`);
};

const io = new Server(server, {
  cors: corsOptions
});

const testingServer = http.createServer();
const io_testing = new Server(testingServer, {
  cors: corsOptions,
  path: '/'
});

const onConnection = (socket: Socket) => {
  socket.data.user = (socket as any).request.session.passport.user;
  try {
    chatHandler(io, socket);
    channelHandler(io, socket);
  } catch (e) {
    handleSocketError(socket, e);
  }

  socket.on('connect_error', (err: any) => {
    log('ERROR', `connect_error due to ${err.message}`);
  });
};

const wrap = (middleware: any) => (socket: Socket, next: any) =>
  middleware(socket.request, {}, next);

io.use(wrap(expressSession));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));
io.use(wrap(checkAuthenticated));

io.on('connection', onConnection);
io_testing.on('connection', (socket) => {
  log('INFO', '[SOCKET (Testing)]::SocketEventTriggered');
  drawingHandler(io_testing, socket);
});

io.of('/').adapter.on('create-room', (room) => {
  log('INFO', `[SOCKET]::EventTriggered:: Room ${room} was created.`);
});

io.of('/').adapter.on('join-room', (room, id) => {
  log('INFO', `[SOCKET]::EventTriggered:: Room ${room} was joined by socket ${id}.`);
});

const testingPort = 5000;
testingServer.listen(testingPort, () => {
  log('INFO', `Socket Testing Server :: Listening on port ${testingPort}`);
});

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

export { io };
