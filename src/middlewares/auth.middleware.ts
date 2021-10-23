import create from 'http-errors';
import { Response, NextFunction, Request } from 'express';

export const checkAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
        return next();
    }

    next(new create.Unauthorized('Unauthorized'));
};

export const checkNotAuthentified = (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
        return next();
    }

    next(new create.NotAcceptable('User is already authentified. To logout, use /auth/logout'));
};
