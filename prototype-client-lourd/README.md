# Prototype Client Lourd

## Setup

Afin de préparer l'environnement de travail, il faut avoir ces outils:

- NodeJS v12+
- Angular CLI
- NPM

Pour rouler l'environnement de travail, simplement lancer la commande:

```
npm install
npm run start
```

## Electron

Afin de lancer l'application sur électron plutôt que sur votre navigateur, il vous faut ces outils:

- Électron

Avec cette commande, vous serez en mesure de rouler l'application sur Électron:

```
npm install
npm run build
npm run electron
```


## Déploiement

Afin de préparer le client desktop, il faut avoir ces outils. Les deux devraient être installés à partir des `node_modules`.

- Electron
- Electron-packager

Pour build l'executable Windows (x64):

```
npm install
npm run build
npm run package-win32
```

On peut aussi rouler le deploiement sur toutes les plateformes:

```
npm run package-all
```



## Attention:

Le client lourd dépend du serveur. Il faut donc faire rouler le serveur avant de pouvoir faire fonctionner le client.