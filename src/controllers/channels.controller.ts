import { Prisma } from '.prisma/client';
import create from 'http-errors';
import { StatusCodes } from 'http-status-codes';
import { createChannel } from './../services/channels.service';
import { Request, Response, NextFunction } from 'express';
import { matchedData, validationResult } from 'express-validator';
import { dbErrorRouters } from '../utils/auth';
import chalk from 'chalk';

export const createChannelController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req).array();
        if (errors.length > 0) {
            res.status(StatusCodes.BAD_REQUEST).json({
                message: errors
            });
        }
        const body = matchedData(req);

        const result = await createChannel(body.name, req.user!.user_id);
        if (!result) throw new create.InternalServerError();
        res.status(StatusCodes.CREATED).json(result.channel);
    } catch (e: any) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            console.log(chalk.red(e.code));
            const error = dbErrorRouters[e.code];
            if (error) return next(create(error.statusCode, error.message));
            else return next(create(create.InternalServerError));
        }
        next(create(e.status, e.message));
    }
};
