# Rapport de Projet : Déploiement d’Applications avec Docker

## 1. Préparation de l'Environnement
Pour ce TP, nous avons configuré un réseau virtuel **VMnet10** sur VMware Workstation avec deux machines distinctes :

*   **Serveur Ubuntu (20.04)** : Machine hôte pour la création et la gestion des conteneurs Docker.
*   **Client RedHat (7.0)** : Machine cliente utilisée pour tester l'accessibilité des services déployés sur le serveur.

---

## 2. Installation de Docker (Serveur Ubuntu)
L'installation a été réalisée en suivant les étapes officielles :

```bash
# Mise à jour des paquets
sudo apt update

# Installation des prérequis pour HTTPS
sudo apt install apt-transport-https ca-certificates curl software-properties-common

# Ajout de la clé GPG officielle Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

# Ajout du référentiel Docker
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"

# Installation du moteur Docker
sudo apt update
sudo apt install docker-ce

# Vérification du statut
sudo systemctl status docker
```

---

## 3. Configuration Initiale
Ajout de l'utilisateur courant au groupe `docker` pour éviter l'usage systématique de `sudo` :

```bash
sudo usermod -aG docker ${USER}
su - ${USER}
```

Vérification avec l'image de test :
```bash
docker run hello-world
```

---

## 4. Première Phase : Application Flask Simple

### 4.1. Dockerfile Initial
```dockerfile
FROM python:3.8-slim-buster
WORKDIR /app
COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt
COPY . .
CMD [ "python3", "-m" , "flask", "run", "--host=0.0.0.0", "--port=80"]
```

### 4.2. Build et Exécution
```bash
# Construction de l'image
docker build --tag python-docker .

# Lancement du conteneur (mappage port 8081 -> 80)
docker run -d -p 8081:80 python-docker
```

### 4.3. Tests d'Accessibilité
*   **Local (Ubuntu)** : `http://localhost:8081`
*   **Distant (RedHat)** : `http://[IP_UBUNTU]:8081`

---

## 5. Phase 2 : Architecture Full-Stack (3-Tiers)
Le projet a été étendu vers une architecture complète comprenant un Frontend, un Backend et une Base de Données.

### 5.1. Composants Logiciels
*   **Frontend** : Application **React** avec gestion du Login et page de succès.
*   **Backend** : API **Flask** (Python 3.11) gérant l'authentification et la connexion DB.
*   **Base de Données** : **PostgreSQL 13** avec initialisation automatique.

---

## 6. Détails de la Conteneurisation (Dockerfiles)

### 6.1. Base de Données (`database/Dockerfile`)
```dockerfile
FROM postgres:13
# Initialisation automatique de la table 'users'
COPY init.sql /docker-entrypoint-initdb.d/
```

### 6.2. Backend (`backend/Dockerfile`)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y libpq-dev gcc
COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python3", "app.py"]
```

### 6.3. Frontend (`frontend/Dockerfile`)
```dockerfile
# Stage 1: Build React
FROM node:18-slim as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 7. Orchestration des Services sur Ubuntu
Le déploiement se fait manuellement via des commandes Docker optimisées pour Bash.

### 7.1. Lancement de la Base de Données
```bash
docker build -t postgres-db ./database
docker run -d --name db \
  -e POSTGRES_DB=mydatabase \
  -e POSTGRES_USER=myuser \
  -e POSTGRES_PASSWORD=mypassword \
  -p 5432:5432 \
  postgres-db
```

### 7.2. Lancement du Backend
```bash
docker build -t flask-backend ./backend
docker run -d --name backend \
  --link db:db \
  -e DB_HOST=db \
  -e DB_NAME=mydatabase \
  -e DB_USER=myuser \
  -e DB_PASSWORD=mypassword \
  -p 5000:5000 \
  flask-backend
```

### 7.3. Lancement du Frontend
```bash
docker build -t react-frontend ./frontend
docker run -d --name frontend -p 8080:80 react-frontend
```

---

## 8. Conclusion et Tests Finaux
L'application est accessible depuis le **Client RedHat** à l'adresse `http://[IP_SERVEUR]:8080`.
*   **Identifiants par défaut** : `admin` / `password123`.
*   **Validation** : La redirection vers la page "Success" confirme la communication entre les trois conteneurs (React -> Flask -> Postgres).