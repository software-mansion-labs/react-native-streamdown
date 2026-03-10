# react-native-streamdown

A streaming-ready markdown component for React Native built on top of [`react-native-enriched-markdown`](https://github.com/Expensify/react-native-enriched-markdown) and [`remend`](https://www.npmjs.com/package/remend).

It processes raw, incomplete markdown (as it streams token-by-token from an LLM) on a background worklet thread using [`react-native-worklets`](https://github.com/margelo/react-native-worklets) Bundle Mode, keeping the JS thread free at all times.

## Features

- Renders incomplete streaming markdown correctly — no visual glitches mid-stream
- Background thread processing via `react-native-worklets` Bundle Mode
- Inline LaTeX support (`$...$`) with streaming completion — applied automatically, no configuration needed (we've also opened a [PR to add this directly to remend](https://github.com/vercel/streamdown/pull/446))
- CommonMark rendering (headers, bold, italic, inline code, fenced code blocks, links, images) powered by `react-native-enriched-markdown` with built-in `streamingAnimation`
- Customisable via `remendConfig`

---

## Installation

```sh
yarn add react-native-streamdown
```

### Peer dependencies

```sh
yarn add react-native-enriched-markdown react-native-worklets remend
```

| Package | Version |
|---|---|
| `react-native-enriched-markdown` | `^0.4.0-nightly-*` |
| `react-native-worklets` | `0.8.0-bundle-mode-preview-1` |
| `remend` | `^1.2.2` |

---

## Required setup — Bundle Mode

`react-native-streamdown` runs markdown processing on a worklet thread using **Bundle Mode** from `react-native-worklets`. This requires three configuration files in your app. For full details see the [official Bundle Mode setup guide](https://docs.swmansion.com/react-native-worklets/docs/bundleMode/setup/) and the [Bundle Mode Showcase App](https://github.com/software-mansion-labs/Bundle-Mode-showcase-app) for a real-world reference.

### 1. `package.json` — enable Bundle Mode flag

```json
{
  "worklets": {
    "staticFeatureFlags": {
      "BUNDLE_MODE_ENABLED": true
    }
  }
}
```

Also add a `postinstall` script to create the `.worklets/` output directory that the Babel plugin writes bundles into:

```json
{
  "scripts": {
    "postinstall": "mkdir -p node_modules/react-native-worklets/.worklets"
  }
}
```

### 2. `package.json` — add recommended Metro patches

These two patches fix known Bundle Mode issues and are strongly recommended. Add them to your app's root `package.json`:

```json
{
  "resolutions": {
    "metro": "patch:metro@npm%3A0.83.2#~/.yarn/patches/metro-npm-0.83.2-d09f48ca84.patch",
    "metro-runtime": "patch:metro-runtime@npm%3A0.83.2#~/.yarn/patches/metro-runtime-npm-0.83.2-c614bbd3b9.patch"
  }
}
```

- **`metro` patch** — fixes `"Failed to get the SHA-1"` errors for `.worklets/` files that Metro can't index fast enough during Bundle Mode bundling.
- **`metro-runtime` patch** — propagates Fast Refresh updates to Worklet Runtimes, so worklet code changes hot-reload correctly without a full app restart.

You can copy the patch files from the `.yarn/patches/` directory of this repository.

### 3. `babel.config.js` — add the worklets plugin with Bundle Mode

```js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'react-native-worklets/plugin',
      {
        bundleMode: true,
        strictGlobal: true,
        workletizableModules: ['remend'],
      },
    ],
  ],
};
```

`workletizableModules: ['remend']` tells the Babel plugin to pre-bundle `remend` for the worklet runtime so it can be called off the JS thread.

### 4. `metro.config.js` — add the Bundle Mode serialiser and resolver

```js
const { getDefaultConfig } = require('@react-native/metro-config');
const { bundleModeMetroConfig } = require('react-native-worklets/bundleMode');

const config = getDefaultConfig(__dirname);

// Watch the .worklets/ output directory
config.watchFolders.push(
  require('path').resolve(
    __dirname,
    'node_modules/react-native-worklets/.worklets'
  )
);

// Resolve react-native-worklets/.worklets/* via the Bundle Mode resolver
const defaultResolver = config.resolver.resolveRequest;
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

// Merge the Bundle Mode serialiser
config.serializer = { ...config.serializer, ...bundleModeMetroConfig.serializer };

module.exports = config;
```


---

## Usage

```tsx
import { StreamdownText } from 'react-native-streamdown';

// rawMarkdown can be updated token-by-token as the LLM streams
<StreamdownText rawMarkdown={partialMarkdown} />
```

### Props

`StreamdownText` accepts all props from `EnrichedMarkdownText` (except `flavor`, which is hardcoded to `commonmark`) plus one additional prop:

| Prop | Type | Description |
|---|---|---|
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
