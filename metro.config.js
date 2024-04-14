const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ajouter la configuration pour inclure les fichiers de police
config.resolver.assetExts.push('ttf', 'otf');

module.exports = config;
