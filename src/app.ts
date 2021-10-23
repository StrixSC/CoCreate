import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import corsOptions from './cors';

// Routes
import indexRouter from './routes/index.route';
import authRouter from './routes/auth.route';
import passport from './passport';
import create, { HttpError } from 'http-errors';
import { setup, serve } from 'swagger-ui-express';
import swaggerDoc from './swagger.json';
import redis from 'redis';
import session from 'express-session';
import connect from 'connect-redis';

const REDIS_URL = process.env.NODE_ENV === 'production' ? process.env.REDIS_URL : '//127.0.0.1:3003';
const RedisStore = connect(session);
const redisClient = redis.createClient({
  url: REDIS_URL,
  password: process.env.REDIS_PASSWORD || 'secret'
});

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    store: new RedisStore({ client: redisClient, prefix: '', ttl: 86400 }),
    cookie: {
      maxAge: 86400
    }
  })
);

redisClient.on('error', (err) => console.log(err));
redisClient.on('connect', function (err) {
  if (err) console.log(err);
  console.log('Connected to redis successfully');
});

app.use(passport.initialize());
app.use(passport.session());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(cors(corsOptions));

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/docs', serve, setup(swaggerDoc));

app.use(async (req, res, next) => {
  next(new create.NotFound('404'));
});

app.use((error: HttpError, req: Request, res: Response, next: NextFunction) => {
  console.error(error);
  res.status(error.status || 500);
  res.json(error);
});

export { app, redisClient };
