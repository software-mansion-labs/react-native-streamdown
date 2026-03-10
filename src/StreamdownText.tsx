import { EnrichedMarkdownText } from 'react-native-enriched-markdown';
import { useStreamdownMarkdown } from './hooks/useStreamdownMarkdown';
import type { StreamdownTextProps } from './types';

/**
 * Streaming-ready markdown component.
 *
 * Processes markdown through remend on a worklet thread,
 * then renders via EnrichedMarkdownText.
 */
export function StreamdownText({
  markdown,
  remendConfig,
  selectable = true,
  ...enrichedMarkdownProps
}: StreamdownTextProps) {
  const { processedMarkdown, isStreaming } = useStreamdownMarkdown(markdown, {
    remendConfig,
  });

  return (
    <EnrichedMarkdownText
      flavor="commonmark"
      markdown={processedMarkdown}
      streamingAnimation
      selectable={!isStreaming && selectable}
      {...enrichedMarkdownProps}
    />
  );
}
