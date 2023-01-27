import {
    NextFunction,
    Response,
    Request
} from 'express';
import admin from 'firebase-admin';

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            authToken: string | null;
            userId: string;
        }
    }
}

admin.initializeApp({
    projectId: 'colorimage-f380e',
    storageBucket: 'colorimage-f380e.appspot.com',
    credential: admin.credential.cert(
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require('../admin.json')
    )
});

export const getAuthToken = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (
        req.headers.authorization &&
        req.headers.authorization.split(
            ' '
        )[0] === 'Bearer'
    ) {
        req.authToken =
            req.headers.authorization.split(
                ' '
            )[1];
    } else {
        req.authToken = null;
    }
    next();
};

const bucket = admin.storage().bucket();
const auth = admin.auth();

export { admin, bucket, auth };
