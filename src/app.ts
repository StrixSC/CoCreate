import cors from 'cors';
import express from 'express';
import session from 'express-session';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import corsOptions from './cors';

// Routes
import indexRouter from './routes/index';
import authRouter from './routes/auth';
import usersRouter from './routes/users';

const app = express();

app.use(
  session({
    secret: process.env.SECRET || 'secret',
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/users', usersRouter);

export { app };
