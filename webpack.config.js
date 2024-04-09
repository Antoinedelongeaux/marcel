const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function(env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Ajouter un fallback pour 'crypto'
  if (!config.resolve.fallback) {
    config.resolve.fallback = {};
  }
  config.resolve.fallback.crypto = require.resolve('crypto-browserify');
  config.resolve.fallback.stream = require.resolve('stream-browserify');
  config.resolve.fallback.vm = require.resolve('vm-browserify');


  // Configuration 'node' existante
  config.node = {
    global: false,
    __filename: false,
    __dirname: false
  };

  return config;
};
