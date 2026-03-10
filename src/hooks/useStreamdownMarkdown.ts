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
  }, [markdown, options?.remendConfig]);

  return { processedMarkdown, isStreaming };
}
