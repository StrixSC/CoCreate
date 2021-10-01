# Prototype - Client Léger

1- Installer Flutter selon les instructions du site officiel de Flutter ( https://flutter.dev/docs/get-started/install/windows )

2- Installer un emulateur Android avec les spécification requises ( document sur Moodle --> Évaluation du prototype )

3- Ouvrir l'émulateur installé à l'étape précédente

4- Rendez vous dans le répertoire 'C:\Users\Username\AppData\Local\Android\Sdk\platform-tools' ( ou dans le répertoire où vous avez installé votre 
SDK Android )

5- Excécuté la commande 'adb reverse tcp:3000 tcp:3000' pour permettre à votre émulateur d'être détecté sur le port 3000*

3- Exécuter la commande 'Flutter run' dans le répertoire où se trouve ce README

5- Sélectionné l'option de votre emulateur

6- L'application devrait s'installer sur votre emulateur et se lancer automatiquement après le build

*Si vous avez l'erreur 'adb.exe: error: no devices/emulators found' fermer le processus 'adb.exe' dans le gestionaire de tâches de votre ordinateur
