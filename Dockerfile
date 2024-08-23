# Utiliser une image Node.js officielle
FROM node:18

# Définir le répertoire de travail dans le conteneur
WORKDIR /usr/src/app

# Copier package.json et package-lock.json dans le conteneur
COPY package*.json ./

# Installer les dépendances
RUN npm install --legacy-peer-deps

# Copier tout le reste du code dans le conteneur
COPY . .

# Construire l'application Expo pour le web
RUN npx expo export

# Installer 'serve' pour servir les fichiers statiques
RUN npm install -g serve

# Exposer le port sur lequel l'application tourne
EXPOSE 3001

# Démarrer le serveur pour servir les fichiers statiques
CMD ["serve", "-s", "dist", "-l", "3001"]
