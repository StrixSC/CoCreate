import cors from 'cors';
import express, { Application } from 'express';
import session from 'express-session';


const corsOptions = {
    optionsSuccessStatus: 200,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Authorization,Uid,Access-Control-Allow-Origin,Origin,X-Requested-With,Content-Type,Accept',
    exposedHeaders: 'Location',
};
const app: Application = express();

app.use(
    session({
        secret: 'keyboard cat',
        saveUninitialized: true,
        cookie: { secure: false },
    }),
);

app.use(cors(corsOptions));

app.use(require('./routes').default);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Listning in port ${PORT}`);
});
