# Utiliser une image Node.js officielle
FROM node:18

# Définir le répertoire de travail dans le conteneur
WORKDIR /usr/src/app

# Copier package.json et package-lock.json dans le conteneur
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Assure-toi que @expo/webpack-config est installé
RUN npm install @expo/webpack-config

# Copier tout le reste du code dans le conteneur
COPY . .

# Exposer le port sur lequel l'application tourne
EXPOSE 3001

# Démarrer l'application
CMD ["npm", "start"]
