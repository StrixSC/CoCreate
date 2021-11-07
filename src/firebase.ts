import { NextFunction, Response, Request } from 'express';
import admin from 'firebase-admin';

declare global {
    namespace Express {
        interface Request {
            authToken: string | null;
            userId: string;
        }
    }
}

admin.initializeApp({
    credential: admin.credential.cert(
        JSON.parse(Buffer.from(process.env.FIREBASE_CERT!, 'base64').toString('ascii'))
    )
});

export const getAuthToken = (req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        req.authToken = req.headers.authorization.split(' ')[1];
    } else {
        req.authToken = null;
    }
    next();
};

export { admin };
