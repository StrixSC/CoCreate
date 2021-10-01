import cors from 'cors';
import express from 'express';
import session from 'express-session';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { Pool } from 'pg';

import corsOptions from './cors';

// Routes
import index from './routes/index';
import auth from './routes/auth';

const connectionString =
    process.env.NODE_ENV === 'production'
      ? process.env.POSTGRESQL_PROD_URL
      : process.env.POSTGRESQL_DEV_URL;

const db = new Pool({
  connectionString,
});

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

app.use('/', index);
app.use('/auth', auth);

export { app, db };
