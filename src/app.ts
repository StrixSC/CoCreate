import cors from 'cors';
import express, { Application } from 'express';
import session from 'express-session';
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { StatusCodes } from 'http-status-codes';
import * as routes from './routes';
import { IUser } from './models/IUser.model';
import { IStdResponse } from './models/IStdResponse.model';
import { ISendMessagePayload } from './models/ISendMessagePayload.model';
import { IReceiveMessagePayload } from './models/IReceiveMessagePayload.model';

const app: Application = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

const corsOptions = {
    optionsSuccessStatus: 200,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: 'Authorization,Uid,Access-Control-Allow-Origin,Origin,X-Requested-With,Content-Type,Accept',
    exposedHeaders: 'Location',
    origin: "*"
}

const io = new Server(httpServer, {
    cors: corsOptions
});

app.use(
    session({
        secret: 'keyboard cat',
        saveUninitialized: true,
        cookie: { secure: false },
    }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

app.use(routes.default);

let users: { [key: string]: IUser } = {};

io.on("connection", (socket: Socket) => {
    socket.on('join-channel', (user: IUser) => {
	console.log(users);
        const allUsers = Object.keys(users);
        allUsers.forEach((id) => {
            if (users[id].username === user.username)
                return socket.emit('exception', {
                    message: "Username is already taken. Please try a different username",
                    status: StatusCodes.BAD_REQUEST
                } as IStdResponse);
        })

        users[socket.id] = { ...user };
        socket.broadcast.emit('user-connection', user.username);
    });

    socket.on('send-message', (payload: ISendMessagePayload) => {
        io.sockets.emit('receive-message', 
        { 
            message: payload.message,
            username: users[socket.id].username,
            timestamp: new Date().toDateString()
        } as IReceiveMessagePayload)
    });

    socket.on('disconnect', () => {
        socket.broadcast.emit('user-disconnect', users[socket.id].username);
        try {
            delete users[socket.id]
        } catch(e) {
            console.error(e);
        }
    });

    socket.on("connect_error", (err) => {
        console.log(`connect_error due to ${err.message}`);
    });
});


httpServer.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
