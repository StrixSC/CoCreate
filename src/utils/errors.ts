import { Socket } from 'socket.io';
import create, { HttpError } from 'http-errors';
import { NextFunction } from 'express';
import { dbErrorRouters } from './auth';
import log from './logger';
import {
    PrismaClientInitializationError,
    PrismaClientKnownRequestError,
    PrismaClientRustPanicError,
    PrismaClientUnknownRequestError,
    PrismaClientValidationError
} from '@prisma/client/runtime';

const isPrismaError = (e: Error) => {
    return (
        e instanceof PrismaClientValidationError ||
        e instanceof PrismaClientRustPanicError ||
        e instanceof PrismaClientKnownRequestError ||
        e instanceof PrismaClientInitializationError ||
        e instanceof PrismaClientUnknownRequestError
    );
};

export const handleRequestError = (e: any, next: NextFunction) => {
    log('DEBUG', e);
    if (isPrismaError(e)) {
        if (e instanceof PrismaClientKnownRequestError) {
            const error = dbErrorRouters[e.code];
            if (error) return next(create(error.statusCode, error.message));
        }
        return next(create(create.InternalServerError));
    }
    next(create(e.status, e.message));
};

export const handleSocketError = (socket: Socket, e: any): boolean => {
    log('DEBUG', e);
    let error = `(${e.code}) - ${e.message}`;
    if (e instanceof HttpError) {
        error = `[${e.status}]:${e.name} - ${e.message}`;
    }

    if (isPrismaError(e)) {
        if (e instanceof PrismaClientKnownRequestError) {
            const error = dbErrorRouters[e.code];
            if (error) return socket.emit('exception', create(error.statusCode, error.message));
        }
        return socket.emit('exception', create(create.InternalServerError));
    }
    return socket.emit('exception', create(error));
};
