import { useState, useEffect, useRef } from 'react';
import { processRemendInWorklet } from '../worklets/remendWorklet';
import type { RemendOptions } from 'remend';

interface UseStreamdownMarkdownOptions {
  remendConfig?: RemendOptions;
}

interface UseStreamdownMarkdownResult {
  processedMarkdown: string;
  isStreaming: boolean;
}

export function useStreamdownMarkdown(
  markdown: string,
  options?: UseStreamdownMarkdownOptions
): UseStreamdownMarkdownResult {
  const [processedMarkdown, setProcessedMarkdown] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const versionRef = useRef(0);

  // Gate the effect on the config's content, not its identity: an inline
  // remendConfig is a fresh object every render and would otherwise reschedule
  // the worklet job on every commit.
  const remendConfigKey = JSON.stringify(options?.remendConfig);

  useEffect(() => {
    if (markdown === '') {
      setProcessedMarkdown('');
      setIsStreaming(false);
      return;
    }

    setIsStreaming(true);
    const currentVersion = ++versionRef.current;

    processRemendInWorklet(
      markdown,
      (result) => {
        if (currentVersion === versionRef.current) {
          setProcessedMarkdown(result);
          setIsStreaming(false);
        }
      },
      options?.remendConfig
    );
    // Reads the live options?.remendConfig; remendConfigKey gates re-runs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markdown, remendConfigKey]);

  return { processedMarkdown, isStreaming };
}
