import type { EnrichedMarkdownTextProps } from 'react-native-enriched-markdown';
import type { RemendOptions } from 'remend';

export interface StreamdownTextProps extends EnrichedMarkdownTextProps {
  /**
   * Optional custom remend configuration.
   */
  remendConfig?: RemendOptions;

  /**
   * Run remend on the JS thread instead of a worklet runtime. Needed on
   * `react-native-worklets` below 0.10, which cannot resolve `remend` inside a
   * worklet. Slower, since the work now shares the JS thread with your UI.
   *
   * @default false
   */
  forceJsThread?: boolean;
}
