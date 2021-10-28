#!/usr/bin/env node
import 'reflect-metadata';
import Debug from 'debug';
import http from 'http';
import { app, expressSession } from '../app';
import { Server, Socket } from 'socket.io';
import corsOptions from '../cors';

// Events
import chatHandler from '../events/chat.events';
import drawingHandler from '../events/drawing.events';
import chalk from 'chalk';
import passport from 'passport';
import { checkAuthenticated } from '../middlewares/auth.middleware';

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

const debug = Debug('Colorimage');
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
  case 'EADDRINUSE':
    console.error(`${bind} is already in use`);
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

  debug(`Listening on ${bind}`);
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
  chatHandler(io, socket);
  socket.on('connect_error', (err: any) => {
    console.log(`connect_error due to ${err.message}`);
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
  console.log(chalk.blueBright('[SOCKET_TESTING]::SocketEventTriggered::'));
  drawingHandler(io_testing, socket);
});

io.of('/').adapter.on('create-room', (room) => {
  console.log(chalk.greenBright(`[SOCKET]::EventTriggered:: Room ${room} was created.`));
});

io.of('/').adapter.on('join-room', (room, id) => {
  console.log(
    chalk.greenBright(`[SOCKET]::EventTriggered:: Room ${room} was joined by socket ${id}.`)
  );
});

testingServer.listen(5000, () => {
  debug(chalk.blueBright('[SOCKET_TESTING]::SocketServer::Listening on port 6000'));
});

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

export { io };
