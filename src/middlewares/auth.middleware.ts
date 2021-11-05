import create from 'http-errors';
import { Response, NextFunction, Request } from 'express';
import log from '../utils/logger';

export const checkAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
        return next();
    }
    // return next();
    next(new create.Unauthorized('Unauthorized'));
};

export const checkNotAuthentified = async (req: Request, res: Response, next: NextFunction) => {
    // if (!req.isAuthenticated()) {
    //     return next();
    // }
    return next();
    next(new create.NotAcceptable('User is already authentified. To logout, use /auth/logout'));
};
