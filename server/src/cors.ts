const CORS_URLS = JSON.parse(JSON.stringify(process.env.CORS!));

const corsOptions = {
    optionsSuccessStatus: 200,
    methods: [
        'GET',
        'HEAD',
        'PUT',
        'PATCH',
        'POST',
        'DELETE',
        'OPTIONS'
    ],
    credentials: true,
    allowedHeaders: [
        'Access-Control-Allow-Credentials',
        'Authorization',
        'Uid',
        'Access-Control-Allow-Origin',
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'x-user-id',
        'X-User-Id'
    ],
    exposedHeaders: 'Location',
    origin: '*'
};

export default corsOptions;
