import { Prisma } from '@prisma/client';
import chalk from 'chalk';
import create from 'http-errors';
import { NextFunction } from 'express';
import { dbErrorRouters } from './auth';

export const handleError = (e: any, next: NextFunction) => {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
        console.log(chalk.red(e.code));
        const error = dbErrorRouters[e.code];
        if (error) return next(create(error.statusCode, error.message));
        else return next(create(create.InternalServerError));
    }
    next(create(e.status, e.message));
};
