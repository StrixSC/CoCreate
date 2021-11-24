import create from 'http-errors';
import { Response, NextFunction, Request } from 'express';
import log from '../utils/logger';
import { admin, getAuthToken } from '../firebase';

export const checkIfAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    getAuthToken(req, res, async () => {
        try {
            const { authToken } = req;
            if (!authToken) {
                throw new create.BadRequest('Invalid or missing auth token');
            }
            const userInfo = await admin.auth().verifyIdToken(authToken);
            req.userId = userInfo.uid;

            return next();
        } catch (e) {
            return next(new create.Unauthorized());
        }
    });
};

export const checkIfSelfRequest = (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const id = req.params.id;

    if (process.env.NODE_ENV === 'production') {
        if (userId === id) {
            return next();
        } else return next(new create.Unauthorized('You are not authorized to view data about this user.'));
    } else return next();
};