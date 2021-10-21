import {
  Strategy as JWTStrategy,
  ExtractJwt,
  VerifiedCallback,
} from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import { db } from './db';
import create from 'http-errors';
import { login } from './services/auth.service';
import passport from 'passport';

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_AUTH_TOKEN_SECRET || 'secret',
};

export const localStrategy = new LocalStrategy(
  { usernameField: 'email', passwordField: 'password' },
  (email: string, password: string, done) => {
    try {
      const jwt = login(email, password);
      if (!jwt)
        return done(
          null,
          false,
          new create.Unauthorized('Invalid email or password')
        );
      return done(null, jwt);
    } catch (e: any) {
      return done(
        e,
        null,
        new create.InternalServerError('Internal server error')
      );
    }
  }
);

export const jwtStrategy = new JWTStrategy(
  opts,
  async (payload: any, done: VerifiedCallback) => {
    try {
      const user = await db.user.findUnique({
        where: {
          user_id: payload.sub
        },
      });
      if (!user)
        return done(
          null,
          false,
          new create.BadRequest('Invalid or missing token')
        );
      return done(null, user);
    } catch (e: any) {
      return done(
        e,
        null,
        new create.InternalServerError('Internal Server Error')
      );
    }
  }
);

passport.use(localStrategy);
passport.use(jwtStrategy);

export default passport;
