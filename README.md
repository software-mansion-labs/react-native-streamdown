# react-native-streamdown

A streaming-ready markdown component for React Native built on top of [`react-native-enriched-markdown`](https://github.com/Expensify/react-native-enriched-markdown) and [`remend`](https://www.npmjs.com/package/remend).

It processes raw, incomplete markdown (as it streams token-by-token from an LLM) in the background using [`react-native-worklets`](https://github.com/margelo/react-native-worklets) powerful concurrency feature - the Bundle Mode - keeping the JS thread free at all times.

## Features

- Renders incomplete streaming markdown correctly — no visual glitches mid-stream
- Background thread processing via `react-native-worklets` Bundle Mode
- Inline LaTeX support (`$...$`) with streaming completion — applied automatically, no configuration needed (we've also opened a [PR to add this directly to remend](https://github.com/vercel/streamdown/pull/446))
- CommonMark rendering (headers, bold, italic, inline code, fenced code blocks, links, images) powered by `react-native-enriched-markdown` with built-in `streamingAnimation`
- Customizable via `remendConfig`

---

## Installation

```sh
yarn add react-native-streamdown
```

### Peer dependencies

```sh
yarn add react-native-enriched-markdown react-native-worklets remend
```

| Package                          | Version                       |
| -------------------------------- | ----------------------------- |
| `react-native-enriched-markdown` | `^0.4.0-nightly-*`            |
| `react-native-worklets`          | `0.8.0-bundle-mode-preview-2` |
| `remend`                         | `^1.2.2`                      |

---

## Required setup — Bundle Mode

`react-native-streamdown` runs markdown processing on a worklet thread using **Bundle Mode** from `react-native-worklets`. This requires extra configuration steps from the [official Bundle Mode setup guide](https://docs.swmansion.com/react-native-worklets/docs/bundleMode/setup/). Make sure to complete these steps before continuing. For a real-world reference of an app configured with Bundle Mode, check out the [Bundle Mode Showcase App](https://github.com/software-mansion-labs/Bundle-Mode-showcase-app).

### 1. `babel.config.js` — configure Worklets Babel plugin

`react-native-streamdown` requires special options to be added to the Worklets Babel plugin config in `babel.config.js`:

```js
const workletsPluginOptions = {
  bundleMode: true,
  // other options...
  workletizableModules: ['remend'], // add this line
};
```

`workletizableModules: ['remend']` tells the Babel plugin to pre-bundle `remend` for the worklet runtime so it can be called off the JS thread.

### 2. `metro.config.js` — configure Metro for monorepos

`react-native-worklets` Bundle Mode generates files on the fly that might not be tracked by Metro in some monorepo setups. It might also shadow your resolving function. If you're running into issues with module resolution, you need to add the following to your `metro.config.js`:

```js
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { bundleModeMetroConfig } = require('react-native-worklets/bundleMode');

let config = getDefaultConfig(__dirname);

// Watch the .worklets/ output directory
config.watchFolders.push(
  require('path').resolve(
    __dirname,
    'node_modules/react-native-worklets/.worklets'
  )
);

// Resolve react-native-worklets/.worklets/* via the Bundle Mode resolver
const defaultResolver = config.resolver.resolveRequest;

config = mergeConfig(config, bundleModeMetroConfig);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('react-native-worklets/.worklets/')) {
    return bundleModeMetroConfig.resolver.resolveRequest(
      context,
      moduleName,
      platform
    );
  }
  return defaultResolver(context, moduleName, platform);
};

module.exports = config;
```

---

## Usage

```tsx
import { StreamdownText } from 'react-native-streamdown';

// rawMarkdown can be updated token-by-token as the LLM streams
<StreamdownText rawMarkdown={partialMarkdown} />;
```

### Props

`StreamdownText` accepts all props from `EnrichedMarkdownText` (except `flavor`, which is hardcoded to `commonmark`) plus one additional prop:

| Prop           | Type            | Description                                                                                                                                 |
| -------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `remendConfig` | `RemendOptions` | Optional. Override the default remend processing config. See [remend docs](https://www.npmjs.com/package/remend) for all available options. |

---

## Example app

The `example/` directory in this repository contains a fully working demo app that shows:

- **Streaming Markdown Simulator** — streams a sample markdown document token-by-token to demonstrate rendering quality and the `streamingAnimation` effect
- **LLM Streaming Demo** — connects to the OpenAI Chat Completions API via SSE and renders the response live using `StreamdownText`

It is a practical reference for the full Bundle Mode setup (Babel, Metro, `package.json` flags) and for how to wire `StreamdownText` into a real streaming UI.

---

## Limitations

- **CommonMark only** — `StreamdownText` currently renders using the `commonmark` flavour of `react-native-enriched-markdown`. GitHub Flavored Markdown (GFM) support is planned for a future release.

---

Built by [Software Mansion](https://swmansion.com/).

[<img width="128" height="69" alt="Software Mansion Logo" src="https://github.com/user-attachments/assets/f0e18471-a7aa-4e80-86ac-87686a86fe56" />](https://swmansion.com/)

---

## License

MIT
