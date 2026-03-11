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

const remendRuntime = createWorkletRuntime('remend-processor');

export function processRemendInWorklet(
  markdown: string,
  onComplete: (result: string) => void,
  config?: RemendOptions
) {
  const mergedConfig = config
    ? { ...defaultRemendConfig, ...config }
    : defaultRemendConfig;

  scheduleOnRuntime(remendRuntime, () => {
    'worklet';
    const result = remend(markdown, mergedConfig);
    scheduleOnRN(onComplete, result);
  });
}
