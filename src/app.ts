import cors from 'cors';
import express, { Application } from 'express';
import session from 'express-session';
import * as routes from './routes';

const corsOptions = {
    optionsSuccessStatus: 200,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Authorization,Uid,Access-Control-Allow-Origin,Origin,X-Requested-With,Content-Type,Accept',
    exposedHeaders: 'Location',
};
const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(
    session({
        secret: 'keyboard cat',
        saveUninitialized: true,
        cookie: { secure: false },
    }),
);

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors(corsOptions));

app.use(routes.default);

app.listen(PORT, () => {
    console.log(`Listening in port ${PORT}`);
});
