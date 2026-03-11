const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withMetroConfig } = require('react-native-monorepo-config');
const { bundleModeMetroConfig } = require('react-native-worklets/bundleMode');

const root = path.resolve(__dirname, '..');

let config = withMetroConfig(getDefaultConfig(__dirname), {
  root,
  dirname: __dirname,
});

// Required when we use `withMetroConfig` from `react-native-monorepo-config`.
config.watchFolders.push(
  path.resolve(__dirname, 'node_modules/react-native-worklets/.worklets'),
  path.resolve(__dirname, '../node_modules/react-native-worklets/.worklets')
);

const monorepoResolver = config.resolver.resolveRequest;

config = mergeConfig(config, bundleModeMetroConfig);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith(path.join('react-native-worklets', '.worklets'))) {
    return bundleModeMetroConfig.resolver.resolveRequest(
      context,
      moduleName,
      platform
    );
  }
  return monorepoResolver(context, moduleName, platform);
};

module.exports = config;
