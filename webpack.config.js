const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function(env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Configurer l'objet 'node' pour désactiver les polyfills inutiles
  config.node = {
    global: false,
    __filename: false,
    __dirname: false
  };

  return config;
};
