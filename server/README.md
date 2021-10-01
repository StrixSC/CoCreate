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
```

ou

```
npm run docker
```

# Deploiment

Requirements:

- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
- [Docker](https://www.docker.com/) (Only if pushing without manifest file)

If it's not already done, login to heroku-cli & add the heroku repo to your remote repos

```
heroku git:remote -a colorimage-109-3900
```
 
To deploy run these commands:

```
git checkout main
git push heroku main
```
Currently live [here!](https://colorimage-109-3900.herokuapp.com/)

<br>

# Évaluation du prototype:

Afin d'évaluer le prototype, il va falloir rouler le serveur en local.

Pour ce faire, vous pouvez utiliser ces commandes:


#### Windows:
```
npm install
npm run dev
```
#### Unix:

```
npm install
npm run dev-unix
```