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

# External Services

The server uses these services:

- PostgreSQL for persistent hard storage.
- Redis for caching and persistent key-value store if the need occurred.
- PgAdmin4 for a GUI management tool to the PostgreSQL instance.

The easiest way to deploy and use them is to use docker. See docker section.

Another way to utilize the services is to install them separately and run them on your local machine. You will have to provide the psql database url in a .env variable (see example.env file for examples).

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