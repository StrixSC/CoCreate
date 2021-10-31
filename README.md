# Colorimage Server

# Setup (Read this first):

- Install Docker if it's not already done.
- Clone the repo
- Go into the repo's directory
- Create a file named `.env`
- Add this line to the `.env` file: `DATABASE_URL=postgresql://admin:admin@localhost:5432/postgres`
- Run `docker-compose up`. If you're on a Unix based machine, you might need to run `sudo docker-compose up`. Wait for this to finish before doing the next step
- Run `npm run setup`.
- The server should now be up and running. 

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
- Database models are defined in the `src/prisma/schema.prisma` file.
- Middlewares are defined in the `src/middlewares` folder and the filename suffix should end with .middleware.ts
- Utilitary functions are defined inside separte files in the `src/utils/` folder.
- Socket events are implemented in the `src/events` folder and triggers are defined inside of the `src/bin/www.ts` file 

The database instance (The prisma client) can be found in `src/db.ts`. To query a table, simply import it and use one of its many functions.

To generate the prisma client, run:

```
npx prisma generate
```

This will generate the code to be used to access, create, update or delete objects in the database. 

To run migrations, which means creating newly defined models into the database, run the following command:

```
npx prisma migrate dev
```

Migrations must be done every time the models are updated. Run migrations afterwards, but make sure you have access to the database.

For prisma database GUI:
```
npx prisma studio
```

# OBSOLETE - Deploiment

This section is obsolete, deployment is done automatically on pushes to the main branch.

--- 

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

# Redis

Redis is used to store sessions and prevent user sessions from being hijacked. Sessions are by default stored for 1 day. `connect-redis` will automatically take care of deleting the keys from those that are timed out. Each SESSID is associated to a user in the back end. On login, we accept the user credentials and assign a new SESSID in the redis server for the given user. 

What this allows us to do:

1. Users cannot be logged in on two devices at once, because upon login, a new SESSID is associated to the user with the given user id.
2. Sessions will be persistent through server resets and fast.

# Automatic Deployment

On pushes to the main branch, the pipeline will automatically build and push the latest docker image to the heroku registry. This will prompt the deployment. 
The prisma migrations will also deploy to the database defined in the `DATABASE_URL` env. variable.

Currently live [here!](https://colorimage-109-3900.herokuapp.com/)
