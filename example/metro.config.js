const path = require('path');
const { getDefaultConfig } = require('@react-native/metro-config');
const { withMetroConfig } = require('react-native-monorepo-config');
const { bundleModeMetroConfig } = require('react-native-worklets/bundleMode');

const root = path.resolve(__dirname, '..');

const config = withMetroConfig(getDefaultConfig(__dirname), {
  root,
  dirname: __dirname,
});

config.watchFolders.push(
  path.resolve(__dirname, 'node_modules/react-native-worklets/.worklets'),
  path.resolve(__dirname, '../node_modules/react-native-worklets/.worklets')
);

const monorepoResolver = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('react-native-worklets/.worklets/')) {
    return bundleModeMetroConfig.resolver.resolveRequest(
      context,
      moduleName,
      platform
    );
  }
  return monorepoResolver(context, moduleName, platform);
};

config.serializer = {
  ...config.serializer,
  ...bundleModeMetroConfig.serializer,
};

module.exports = config;
