import { Platform } from 'react-native';
import {
  createWorkletRuntime,
  scheduleOnRuntime,
  scheduleOnRN,
} from 'react-native-worklets';
import remend from 'remend';
import type { RemendOptions } from 'remend';

const defaultRemendConfig: RemendOptions = {
  bold: true,
  italic: true,
  boldItalic: true,
  strikethrough: true,
  links: true,
  linkMode: 'text-only',
  images: true,
  inlineCode: true,
  katex: false,
  setextHeadings: true,
};

// react-native-worklets' web build ships the runtime APIs as throwing stubs,
// so on web remend runs on the JS thread; scheduleOnRN works there (microtask).
const remendRuntime =
  Platform.OS === 'web'
    ? null
    : createWorkletRuntime({ name: 'remend-processor' });

export function processRemendInWorklet(
  markdown: string,
  onComplete: (result: string) => void,
  config?: RemendOptions,
  forceJsThread = false
) {
  const mergedConfig = config
    ? { ...defaultRemendConfig, ...config }
    : defaultRemendConfig;

  // Two ways to land on the JS thread: web has no worklet runtime at all, or the app
  // opted out because its react-native-worklets is too old to hand `remend` to a worklet.
  if (remendRuntime == null || forceJsThread) {
    scheduleOnRN(onComplete, remend(markdown, mergedConfig));
    return;
  }

  scheduleOnRuntime(remendRuntime, () => {
    'worklet';
    const result = remend(markdown, mergedConfig);
    scheduleOnRN(onComplete, result);
  });
}
