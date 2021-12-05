import { ExceptionType } from './../models/Exceptions.enum';
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
            if (error) return next(create(error));
        }
        return next(create(create.InternalServerError));
    }
    next(create(e.status, e.message));
};

export const handleSocketError = (socket: Socket, e: any, exceptionType?: ExceptionType, exceptionTypes?: ExceptionType[]): boolean => {
    let error = `(${e.code}) - ${e.message}`;
    if (e instanceof HttpError) {
        error = `[${e.status}]:${e.name} - ${e.message}`;
    }

    if (isPrismaError(e)) {
        if (e instanceof PrismaClientKnownRequestError) {
            const dbError = dbErrorRouters[e.code];
            if (error) error = dbError;
        }
    }

    if (exceptionType) {
        return socket.emit(exceptionType, create(error));
    } else if (exceptionTypes) {
        exceptionTypes.forEach((e) => {
            socket.emit(e, create(error))
        });
        return true;
    } else {
        return socket.emit('exception', create(error));
    };

}
