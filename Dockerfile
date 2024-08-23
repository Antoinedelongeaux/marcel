# Utiliser l'image officielle Node.js
FROM node:18

# Créer et définir le répertoire de travail dans le container
WORKDIR /usr/src/app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install -g rn-nodeify \
    && npm install --production --legacy-peer-deps \
    && rn-nodeify --install --hack

# Installer les dépendances
RUN npm install --production --legacy-peer-deps

# Copier le reste de l'application
COPY . .

# Exposer le port que l'application utilisera
EXPOSE 3001

# Commande de lancement de l'application
CMD ["npm", "start"]
