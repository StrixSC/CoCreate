import { Request } from 'express';
import { Strategy as LocalStrategy } from 'passport-local';
import create from 'http-errors';
import { login, findUserById } from './services/auth.service';
import passport from 'passport';
import { User as PrismaUser } from '@prisma/client';
import { getAsync, keysAsync, redisClient } from './app';

declare global {
    namespace Express {
        interface User extends PrismaUser {}
        interface Session {
            cookie: {
                originalMaxAge: number;
                expires: string;
                httpOnly: boolean;
                path: string;
            };
            passport: {
                user: string;
            };
        }
    }
}

export const checkPreviousSessions = async (uid: string) => {
    const keys = await keysAsync('sess:*'); // TODO: Extract prefix to variable
    keys.forEach(async (key: string) => {
        const val = (await getAsync(key)) as string;
        // let jsonVal;
        if (val.includes(uid)) {
            redisClient.del(key);
        }

        // try {
        // jsonVal = JSON.parse(val) as Express.Session;
        // } catch (e) {
        // throw new create.InternalServerError();
        // }
        //
        // if (uid === jsonVal.passport.user) {
        // redisClient.del(key);
        // }
    });
};

export const localStrategy = new LocalStrategy(
    { usernameField: 'email', passwordField: 'password', passReqToCallback: true },
    async (req: Request, email: string, password: string, done) => {
        try {
            const user = await login(email, password);
            if (!user) {
                return done(null, false, new create.Unauthorized('Invalid email or password'));
            }

            await checkPreviousSessions(user.user_id);
            return done(null, user);
        } catch (e: any) {
            return done(e, null, new create.InternalServerError('Internal server error'));
        }
    }
);

passport.use(localStrategy);
passport.serializeUser((user: Express.User, done: (err: any, id: any) => void) =>
    done(null, user.user_id)
);
passport.deserializeUser(async (id: string, done: (err: any, user: any) => void) => {
    try {
        const user = await findUserById(id);
        if (!user) done(null, false);
        done(null, user);
    } catch (e: any) {
        done(e, null);
    }
});

export default passport;
