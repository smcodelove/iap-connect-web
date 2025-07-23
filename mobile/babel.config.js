// babel.config.js (create this file if it doesn't exist)
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin', // if using reanimated
    ],
  };
};