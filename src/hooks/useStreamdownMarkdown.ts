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

  // The config must be compared by content, not identity: StreamdownText
  // forwards the caller's remendConfig through a fresh options literal every
  // render, so an inline config (the documented usage) would otherwise re-run
  // this effect on every commit and reschedule the whole-document worklet job
  // without bound. A serialized key is the stable dependency.
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
    // The effect intentionally reads the live options?.remendConfig; the
    // serialized key above is what gates re-runs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markdown, remendConfigKey]);

  return { processedMarkdown, isStreaming };
}
