import { Strategy as LocalStrategy } from 'passport-local';
import create from 'http-errors';
import { login, findUserById } from './services/auth.service';
import passport from 'passport';
import { User as PrismaUser } from '@prisma/client';

declare global {
    namespace Express {
        interface User extends PrismaUser {}
    }
}

export const localStrategy = new LocalStrategy(
    { usernameField: 'email', passwordField: 'password' },
    async (email: string, password: string, done) => {
        try {
            const user = await login(email, password);
            if (!user) return done(null, false, new create.Unauthorized('Invalid email or password'));
            return done(null, user);
        } catch (e: any) {
            return done(e, null, new create.InternalServerError('Internal server error'));
        }
    }
);

passport.use(localStrategy);
passport.serializeUser((user: Express.User, done: (err: any, id: any) => void) => done(null, user.user_id));
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
