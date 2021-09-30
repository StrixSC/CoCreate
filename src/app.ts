import cors from 'cors';
import express from 'express';
import session from 'express-session';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { Server, Socket } from 'socket.io';
import { StatusCodes } from 'http-status-codes';
import { IUser } from './models/IUser.model';
import { IStdResponse } from './models/IStdResponse.model';
import { ISendMessagePayload } from './models/ISendMessagePayload.model';
import { IReceiveMessagePayload } from './models/IReceiveMessagePayload.model';
import { Client } from 'pg';
import { server } from './bin/www';
import corsOptions from './cors';

// Routes
import index from './routes/index';
import auth from './routes/auth';

const client = new Client({
  user: process.env.POSTGRESQL_USERNAME,
  host:
    process.env.NODE_ENV === 'production'
      ? process.env.POSTGRESQL_PROD_URL
      : process.env.POSTGRESQL_DEV_URL,
  database: process.env.POSTGRESQL_DB,
  password: process.env.POSTGRESQL_PASSWD,
  port: parseInt(process.env.POSTGRESQL_PORT || '5432', 10),
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

const users: { [key: string]: IUser } = {};

const io = new Server(server, {
  cors: corsOptions,
});

io.on('connection', (socket: Socket) => {
  socket.on('join-channel', (user: IUser) => {
    console.log(users);
    const allUsers = Object.keys(users);
    allUsers.forEach((id) => {
      if (users[id].username === user.username)
        return socket.emit('exception', {
          message: 'Username is already taken. Please try a different username',
          status: StatusCodes.BAD_REQUEST,
        } as IStdResponse);
    });

    users[socket.id] = { ...user };
    socket.broadcast.emit('user-connection', user.username);
  });

  socket.on('send-message', (payload: ISendMessagePayload) => {
    io.sockets.emit('receive-message', {
      message: payload.message,
      username: users[socket.id].username,
      timestamp: new Date().toDateString(),
    } as IReceiveMessagePayload);
  });

  socket.on('disconnect', () => {
    socket.broadcast.emit('user-disconnect', users[socket.id].username);
    try {
      delete users[socket.id];
    } catch (e) {
      console.error(e);
    }
  });

  socket.on('connect_error', (err) => {
    console.log(`connect_error due to ${err.message}`);
  });
});

export default app;
