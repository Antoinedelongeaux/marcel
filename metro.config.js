const { getDefaultConfig } = require('expo/metro-config');

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);

  // Setup the transformer to use react-native-svg-transformer for SVG files
  config.transformer = {
    ...config.transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
    // Make sure asset plugins are configured, including hashing if necessary
    assetPlugins: [...(config.transformer.assetPlugins || []), 'expo-asset/tools/hashAssetFiles'],
  };

  // Configure the resolver to handle SVG files as source extensions and exclude them from assets
  config.resolver = {
    ...config.resolver,
    assetExts: config.resolver.assetExts.filter(ext => ext !== 'svg'), // Exclude SVGs from being treated as assets
    sourceExts: [...config.resolver.sourceExts, 'svg'], // Include SVGs as source files to be transformed
    // Include font file types as asset extensions
    assetExts: [...config.resolver.assetExts, 'ttf', 'otf'],
  };

  return config;
})();
