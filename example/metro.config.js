const path = require('path');
const { getDefaultConfig } = require('@react-native/metro-config');
const { withMetroConfig } = require('react-native-monorepo-config');
const {
  getBundleModeMetroConfig,
} = require('react-native-worklets/bundleMode');

const root = path.resolve(__dirname, '..');

const config = withMetroConfig(getDefaultConfig(__dirname), {
  root,
  dirname: __dirname,
});

// Required when we use `withMetroConfig` from `react-native-monorepo-config`.
config.watchFolders.push(
  path.resolve(__dirname, 'node_modules/react-native-worklets/.worklets'),
  path.resolve(__dirname, '../node_modules/react-native-worklets/.worklets')
);

module.exports = getBundleModeMetroConfig(config);
