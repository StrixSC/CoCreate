# Colorimage Server

# Traditional Setup

```
npm run dev
```

# Setup Docker

Requirements:
- [Docker](https://www.docker.com/)
- [docker-compose](https://docs.docker.com/compose/install/)

```
(sudo) docker-compose up --build --force-recreate --renew-anon-volumes
ou
npm run docker
```

You can also run separte services by specifying their names:

```
(sudo) docker-compose up postgres redis pgadmin
```

This will only launch the respective services.

# External Services

The server uses these services:

- PostgreSQL for persistent hard storage.
- Redis for caching and persistent key-value store if the need occurred.
- PgAdmin4 for a GUI management tool to the PostgreSQL instance.
- Prisma as ORM

The easiest way to deploy and use them is to use docker. See docker section.

Another way to utilize the services is to install them separately and run them on your local machine. You will have to provide the psql database url in a .env variable (see example.env file for examples).

# Development

- Routes are defined in the `src/routes/` folder and the filename.
- Controllers are defined in the `src/controllers` folder and the filename should end with `.controller.ts`.
- Interfaces are defined inside of the `src/models/` folder and the filename should end with `.model.ts`.
- Services are defined inside of the `src/services/` folder and the filename should end with `.service.ts`.
- Database models are defined in the `src/prisma/scheme.prisma` file.
- Middlewares are defined in the `src/middlewares` folder and the filename suffix should end with .middleware.ts
- Utilitary functions are defined inside separte files in the `src/utils/` folder.
- Socket events are implemented in the `src/events` folder and triggers are defined inside of the `src/bin/www.ts` file 

The database instance (The prisma client) can be found in `src/db.ts`. To query a table, simply import it and use one of its many functions.

To update a model in the database, run:

```
npx prisma generate
```

This will generate the code necessary for the migration. Migrations must be done every time the models are updated. Run migrations afterwards, but make sure you have access to the database.

Migrations can be run as so:

```
npx prisma migrate dev
```

# Deploiment

Requirements:

- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
- [Docker](https://www.docker.com/) (Only if pushing without manifest file)

If it's not already done, add the heroku repo to your remote repos

```
heroku git:remote -a colorimage-109-3900:
```
 
To deploy run these commands:

```
git checkout main
git push heroku main
```

Currently live [here!](https://colorimage-109-3900.herokuapp.com/)