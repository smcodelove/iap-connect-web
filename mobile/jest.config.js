module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|@react-navigation)',
  ],
  testEnvironment: 'jsdom',
  setupFiles: [
    './jest.setup.js'
  ],
};
