Partie B : Déploiement d’applications avec Dockers

1. Préparation de l’environnement sous VMware Workstation
Pour atteindre les objectifs du TP, les machines suivantes sont créées et configurées 
sur VMware Workstation dans le réseau virtuel VMnet10 :

1.1. Serveur Ubuntu
- Cette machine ayant Ubuntu 20.04 comme système d’exploitation.
- C’est dans cette machine que nous allons créer et gérer les images Docker.

1.2. Client RedHat
- Cette machine a comme système d’exploitation RedHat 7.0, elle joue le rôle de 
  client pour accéder au serveur Ubuntu.

2. Installation de Docker
Commençons tout d’abord par mettre à jour la liste des paquets déjà existants 
au niveau du Serveur Ubuntu :
sudo apt update

Une fois terminé, installons les paquets nécessaires pour permettre à APT 
d’utiliser des paquets via HTTPS :
sudo apt install apt-transport-https ca-certificates curl software-properties-common

Maintenant, nous devons ajouter la clé GPG du référentiel Docker officiel à 
notre système pour garantir la validité des téléchargements :
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

Ajoutons par la suite le référentiel Docker aux sources APT :
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"

Mettons à jour tous les paquets (paquets du référentiel Docker) que nous 
venons d’ajouter :
sudo apt update

Il ne reste plus qu’à installer Docker en utilisant la commande suivante :
sudo apt install docker-ce

Exécutons la commande suivante pour vérifier que le Docker s’est bien 
installé et qu’il est actif :
sudo systemctl status docker

3. Utilisation de Docker
Commençons d’abord par ajouter l’utilisateur au groupe docker, question d’éviter 
à chaque fois de faire appel à l’utilisateur root :
sudo usermod -aG docker ${USER}

Pour activer les changements aux groupes, utilisons la commande suivante :
su - ${USER}

Démarrons l’image Docker hello-world pour vérifier que l’installation a bien été faite :
docker run hello-world

Nous pouvons vérifier également que, pour l’instant, nous n’avons aucune image Docker locale :
docker images

3.1. Création d’une image Docker
Pour créer une image Docker, nous devons d’abord créer un fichier nommé Dockerfile. 
Ce dernier est la description des différentes étapes à suivre pour construire notre image.



Contenu du Dockerfile utilisé :
--------------------------------------------------
FROM python:3.8-slim-buster
WORKDIR /app
COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt
COPY . .
CMD [ "python3", "-m" , "flask", "run", "--host=0.0.0.0", "--port=80"]
--------------------------------------------------

Le fichier « requirements.txt » contient les bibliothèques nécessaires :
Flask

L’application web en question (créée à base de flask) contient un simple message 
qui s’affiche à l’utilisateur (app.py) :
--------------------------------------------------
from flask import Flask
app = Flask(__name__)

@app.route('/')
def hello_world():
    return 'Hello, Docker!'
--------------------------------------------------

Créer l’image Docker à partir du Dockerfile :
docker build --tag python-docker .

Démarrons le conteneur en spécifiant que le site est accessible à partir du 
port 8081 de la machine locale :
docker run -d -p 8081:80 python-docker

Pour afficher la liste des conteneurs actifs :
docker ps

3.2. Tests
Vérifions que l’application web est accessible à partir de la machine locale 
(c’est-à-dire à partir du serveur Ubuntu) :
Lancement du navigateur sur http://localhost:8081

Vérifions cette fois que l’application web est accessible à partir de la machine 
cliente (c’est-à-dire à partir du client Redhat) :
Accès via l'adresse IP du serveur sur le port 8081.

Si nous souhaitons arrêter le conteneur, il suffit juste d’exécuter la commande 
suivante en spécifiant l’ID du conteneur :
docker stop [ID_DU_CONTENEUR]

Affichons la liste des conteneurs actifs pour confirmer :
docker ps

4. Partage et Portabilité de l'image (Docker Hub)
Pour rendre notre application portable et accessible depuis d'autres machines, 
nous allons utiliser un registre d'images (Docker Hub).

4.1. Connexion au Registre
Connectons-nous à notre compte Docker Hub depuis le terminal :
docker login

4.2. Tag de l'image
Pour publier l'image, nous devons lui donner un nom qui inclut notre nom 
d'utilisateur Docker Hub ([NOM_UTILISATEUR]) :
docker tag python-docker [NOM_UTILISATEUR]/python-docker

4.3. Publication (Push)
Envoyons maintenant l'image vers le registre :
docker push [NOM_UTILISATEUR]/python-docker

5. Déploiement sur le Client RedHat
Maintenant que l'image est hébergée sur Docker Hub, nous pouvons la déployer 
sur n'importe quelle autre machine disposant de Docker, comme notre client RedHat.

5.1. Récupération de l'image (Pull)
Sur la machine RedHat, téléchargeons l'image que nous venons de pousser :
docker pull [NOM_UTILISATEUR]/python-docker

5.2. Exécution et Verification
Démarrons le conteneur sur le client RedHat :
docker run -d -p 8081:80 [NOM_UTILISATEUR]/python-docker

Nous pouvons maintenant vérifier que l'application fonctionne en accédant à 
l'adresse IP du client RedHat sur le port 8081.

6. Extension vers une Architecture Full-Stack
Pour faire évoluer le projet, nous avons mis en place une architecture 3-tiers 
comprenant un Frontend (React), un Backend (Flask) et une Base de Données (PostgreSQL).

6.1. Frontend (React)
- Création d'une application React avec deux vues principales :
  * Login : Formulaire d'authentification envoyant des requêtes POST au backend.
  * Success : Page de confirmation affichée après une authentification réussie.

6.2. Backend (Flask)
- Amélioration de l'application app.py pour gérer :
  * La connexion à la base de données PostgreSQL via psycopg2.
  * Un endpoint /login pour vérifier les identifiants en base.
  * La gestion du CORS (flask-cors) pour permettre la communication avec le frontend.

6.3. Base de Données (PostgreSQL)
- Utilisation de PostgreSQL pour stocker les utilisateurs.
- Création d'un script "init.sql" pour automatiser la création de la table 'users' 
  et l'insertion d'un compte administrateur par défaut (admin / password123).

7. Conteneurisation des Services
Chaque service dispose désormais de son propre Dockerfile pour une isolation complète.

7.1. Dockerfile Backend
- Base : python:3.11-slim
- Installation des dépendances (Flask, psycopg2, etc.) et exposition du port 5000.

7.2. Dockerfile Frontend (Multi-stage)
- Étape 1 : Build de l'application React avec Node.js.
- Étape 2 : Service des fichiers statiques via un serveur Nginx sur le port 80.

7.3. Dockerfile Database
- Base : postgres:13
- Copie automatique du script init.sql dans /docker-entrypoint-initdb.d/ pour 
  une initialisation au démarrage du conteneur.

8. Orchestration et Déploiement Multi-VM (Ubuntu / RedHat)
La gestion des conteneurs se fait sur le Serveur Ubuntu via des scripts de 
commandes simplifiés (txt) pour faciliter le déploiement.

8.1. Déploiement (Ubuntu Server)
- Build et exécution dans l'ordre : Base de données -> Backend -> Frontend.
- Utilisation du flag --link pour permettre au backend de communiquer avec la DB.

8.2. Accès Client (RedHat)
- Accès via le navigateur à l'adresse http://[IP_SERVEUR_UBUNTU]:8080.
- La communication est fluide sur le réseau VMnet10.