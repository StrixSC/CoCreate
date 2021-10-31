import { Socket } from 'socket.io';
import { Prisma } from '@prisma/client';
import create from 'http-errors';
import { NextFunction } from 'express';
import { dbErrorRouters } from './auth';
import log from './logger';

export const handleRequestError = (e: any, next: NextFunction) => {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
        log('ERROR', e.code);
        const error = dbErrorRouters[e.code];
        if (error) return next(create(error.statusCode, error.message));
        else return next(create(create.InternalServerError));
    }
    next(create(e.status, e.message));
};

export const handleSocketError = (socket: Socket, e: any): boolean => {
    const error = `(${e.code}) - ${e.message}`;
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
        const error = dbErrorRouters[e.code];
        if (error) return socket.emit('exception', create(error.statusCode, error.message));
    }
    return socket.emit('exception', create(error));
};
