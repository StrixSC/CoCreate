[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]

<!-- PROJECT LOGO -->
<br />
<p align="center">

  <h3 align="center">PolyDessin LOG2990  - Projet de logiciel d’application Web</h3>

  <p align="center">
    Le projet consiste à créer une application Web de dessin vectoriel avec le MEAN stack. 
  </p>
    <p align="center">
      À noter: Lorsqu'on efface, il y a un stroke-rouge et un fill-bleu. Il échoue sur firefox.  
    </p>
</p>

## &nbsp;

<!-- TABLE OF CONTENTS -->

## table des matières

- [Description du projet](#description-projet)
  - [Technologies utilisées](#technologies-utilisees)
- [Démarrer le projet](#demarrer-le-projet)
  - [Prérequis](#prerequis)
  - [Installation](#installation)
- [Utilisation](#usage)
- [Dépendances](#dependences)

<!-- ABOUT THE PROJECT -->

## description-projet

Le rendu visuel de reference de l'application pourrait etre similaire a celui de Sketch pad.

- Crayon: L'outil de base du logiciel de dessin. Il permet de faire un trait de contour ronde. Si appuyé et relaché aussitôt, c'est bien un point qui apparaît.
- Pinceau : L'outil differe seulement du crayon par la texture du trait.
- Plume: L'outil de tracage qui differe du crayon par la forme mince de sa pointe.
- Stylo: L'outil differe du crayon par le fait que la surface de dessin s'amincit en fonction de la vitesse de deplacement de la souris
- Formes: Les outils de création de formes sont: Rectangle,Ellipse,Polygone,Ligne. Ces dernieres sont apposes sur la zone de dessin en faisant un glisser-deposer.
- Texte:
- Aerosol: L'outil simule un effet de peinture en aerosol
- Sceau de peinture: L'outil qui change la couleur d'une certaine region pointé par la souris.
- Efface: L'outil permet de supprimer des objets de la surface du dessin.

### technologies-utilisees

Cette section énumère les technologies principales utilisées afin de construire l'application

- [Angular](https://angular.io)
- [NodeJs](https://nodejs.org/)

<!-- GETTING STARTED -->

## demarrer-le-projet

### prerequis

- npm
- Nodemon

### installation

- Installer `npm` (non recommandé) ou `yarn` (très recommandé). `npm` viens avec `Node` que vous pouvez télecharger [ici](https://nodejs.org/en/download/)

- Lancer `npm install` ou `yarn`

### lancement

- exécuter: `npm start` ou `yarn start` dans le dossier `client` et `server`

Pour le client :
Une page menant vers `http://localhost:4200/` s'ouvrira automatiquement.

Pour le serveur :
Votre serveur est accessible sur `http://localhost:3000`. Par défaut, votre client fait une requête `GET` vers le serveur pour obtenir un message.

<!-- USAGE EXAMPLES -->

## usage

![loading...](https://i.imgur.com/ZaDpH11.png)

<!-- ACKNOWLEDGEMENTS -->

## dépendances

- font-awesome
- material module
