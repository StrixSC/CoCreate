#!/usr/bin/env node

import dotenv from 'dotenv';
dotenv.config();
import 'reflect-metadata';
import http from 'http';
import { app } from '../app';
import { Server, Socket } from 'socket.io';
import corsOptions from '../cors';
import { checkIfAuthenticated } from '../middlewares/auth.middleware';
import { handleSocketError } from './../utils/errors';
import { logEvent } from './../middlewares/socket.middleware';

// Events
import drawingHandler from '../events/drawing.events';
import channelHandler from '../events/channels.events';
import collaborationHandler from '../events/collaboration.events';
import disconnectHandler from '../events/connection.events';
import teamsHandler from '../events/teams.events';
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

const onConnection = (socket: Socket) => {
    socket.use(logEvent(socket));

    if (process.env.NODE_ENV === 'production' || process.env.ENABLE_AUTH) {
        socket.data.user = (socket as any).request.userId;
        socket.data.username = (socket as any).request.username;
    } else socket.data.user = 'DEMO';

    try {
        channelHandler(io, socket);
        drawingHandler(io, socket);
        collaborationHandler(io, socket);
        teamsHandler(io, socket);
        disconnectHandler(io, socket);

    } catch (e) {
        handleSocketError(socket, e);
    }

    socket.on('connect_error', (err: any) => {
        log('ERROR', `connect_error due to ${err.message}`);
    });
};

const wrap = (middleware: any) => (socket: Socket, next: any) =>
    middleware(socket.request, {}, next);

if (process.env.NODE_ENV === 'production' || process.env.ENABLE_AUTH) {
    io.use(wrap(checkIfAuthenticated));
}

io.on('connection', onConnection);

io.of('/').adapter.on('create-room', (room) => {
    log('DEBUG', `Room ${room} was created.`);
});

io.of('/').adapter.on('join-room', (room, id) => {
    log('DEBUG', `Room ${room} was joined by socket ${id}.`);
});

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

export { io };
