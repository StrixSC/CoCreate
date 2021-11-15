import cors from 'cors';
import express, {
    NextFunction,
    Request,
    Response
} from 'express';
import morgan from 'morgan';
import corsOptions from './cors';
import create, { HttpError } from 'http-errors';
import { setup, serve } from 'swagger-ui-express';
import swaggerDoc from './swagger.json';
import redis from 'redis';
import session from 'express-session';
import connect from 'connect-redis';
import { promisify } from 'util';

// Routes
import indexRouter from './routes/index.route';
import authRouter from './routes/auth.route';
import usersRouter from './routes/users.route';
import channelsRouter from './routes/channels.route';
import galleryRouter from './routes/gallery.route';
import log from './utils/logger';

const REDIS_URL =
    process.env.NODE_ENV === 'production'
        ? process.env.REDIS_URL
        : '//127.0.0.1:3003';
const RedisStore = connect(session);
const redisClient = redis.createClient({
    url: REDIS_URL,
    password:
        process.env.REDIS_PASSWORD || 'secret'
});
const getAsync = promisify(redisClient.get).bind(
    redisClient
);
const keysAsync = promisify(
    redisClient.keys
).bind(redisClient);
const setAsync = promisify(redisClient.set).bind(
    redisClient
);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

redisClient.on('error', (err) => {
    log('ERROR', err);
});

redisClient.on('connect', function (err) {
    if (err) log('ERROR', err);
    log(
        'SUCCESS',
        'Connected to redis successfully'
    );
});

const corsSetup = cors(corsOptions);

app.use(
    morgan(
        process.env.NODE_ENV === 'production'
            ? 'combined'
            : 'dev'
    )
);
app.use(corsSetup);
app.options('*', corsSetup);
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/channels', channelsRouter);
app.use('/api/gallery', galleryRouter);
app.use('/docs', serve, setup(swaggerDoc));

app.use(async (req, res, next) => {
    next(new create.NotFound('404'));
});

app.use(
    (
        error: HttpError,
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        log('CRITICAL', error);
        if (error instanceof HttpError) {
            res.status(error.status).json(error);
        } else {
            log('CRITICAL', error);
            res.status(500).json(
                create(
                    new create.InternalServerError()
                )
            );
        }
    }
);

export {
    app,
    redisClient,
    getAsync,
    keysAsync,
    setAsync
};
