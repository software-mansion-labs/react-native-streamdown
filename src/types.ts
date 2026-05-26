import type { EnrichedMarkdownTextProps } from 'react-native-enriched-markdown';
import type { RemendOptions } from 'remend';

export interface StreamdownTextProps extends EnrichedMarkdownTextProps {
  /**
   * Optional custom remend configuration.
   */
  remendConfig?: RemendOptions;
}
