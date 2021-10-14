import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import corsOptions from './cors';

// Routes
import indexRouter from './routes/index.route';
import authRouter from './routes/auth.route';
import passport from './passport';
import create, { HttpError } from 'http-errors';
import { setup, serve } from 'swagger-ui-express';
import swaggerDoc from './swagger.json';

const app = express();
app.use(passport.initialize());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/auth', authRouter);

app.use(
  "/docs",
  serve,
  setup(swaggerDoc)
);

app.use(async (req, res, next) => {
  next(new create.NotFound('404'));
});

app.use((error: HttpError, req: Request, res: Response, next: NextFunction) => {
  res.status(error.status || 500);
  res.json(error);
});

export { app };
