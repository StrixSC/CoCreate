const corsOptions = {
  optionsSuccessStatus: 200,
  methods: [ 'GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS' ],
  credentials: true,
  allowedHeaders:
        'Authorization,Uid,Access-Control-Allow-Origin,Origin,X-Requested-With,Content-Type,Accept',
  exposedHeaders: 'Location',
  origin: [
    'http://localhost:4200',
    'http://localhost:5554',
    'http://localhost:5556',
    'http://localhost:5556'
  ]
};

export default corsOptions;
