const corsOptions = {
  optionsSuccessStatus: 200,
  methods: [ 'GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS' ],
  credentials: true,
  allowedHeaders:
    'Authorization,Uid,Access-Control-Allow-Origin,Origin,X-Requested-With,Content-Type,Accept',
  exposedHeaders: 'Location',
  origin: '*',
};

export default corsOptions;
