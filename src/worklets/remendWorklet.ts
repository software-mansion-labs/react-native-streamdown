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
  config?: RemendOptions
) {
  const mergedConfig = config
    ? { ...defaultRemendConfig, ...config }
    : defaultRemendConfig;

  if (remendRuntime == null) {
    scheduleOnRN(onComplete, remend(markdown, mergedConfig));
    return;
  }

  scheduleOnRuntime(remendRuntime, () => {
    'worklet';
    const result = remend(markdown, mergedConfig);
    scheduleOnRN(onComplete, result);
  });
}
