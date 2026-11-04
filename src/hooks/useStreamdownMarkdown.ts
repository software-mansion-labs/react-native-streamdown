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

interface RemendResult {
  /** The markdown this result was computed from. */
  source: string;
  processed: string;
}

const EMPTY_RESULT: RemendResult = { source: '', processed: '' };

export function useStreamdownMarkdown(
  markdown: string,
  options?: UseStreamdownMarkdownOptions
): UseStreamdownMarkdownResult {
  // State is only set from the worklet callback, never from the effect body.
  // A setState in the effect queues a second render for every markdown change;
  // when the markdown comes from a synchronous store (e.g. `useSyncExternalStore`
  // in AI SDK `useChat`) and the JS thread is busy, those follow-up updates
  // count as nested updates and React throws "Maximum update depth exceeded"
  // after ~50 chunks.
  const [result, setResult] = useState<RemendResult>(EMPTY_RESULT);
  const versionRef = useRef(0);
  const appliedVersionRef = useRef(0);

  // Gate the effect on the config's content, not its identity: an inline
  // remendConfig is a fresh object every render and would otherwise reschedule
  // the worklet job on every commit.
  const remendConfigKey = JSON.stringify(options?.remendConfig);

  useEffect(() => {
    const currentVersion = ++versionRef.current;

    if (markdown === '') {
      // Results of jobs started before the markdown was cleared are stale.
      appliedVersionRef.current = currentVersion;
      return;
    }

    processRemendInWorklet(
      markdown,
      (processed) => {
        // Apply any result newer than the one shown, not only the latest:
        // when a round-trip takes longer than the gap between chunks, a
        // latest-only check would drop every result and freeze the text
        // until the stream pauses.
        if (currentVersion > appliedVersionRef.current) {
          appliedVersionRef.current = currentVersion;
          setResult({ source: markdown, processed });
        }
      },
      options?.remendConfig
    );
    // Reads the live options?.remendConfig; remendConfigKey gates re-runs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markdown, remendConfigKey]);

  if (markdown === '') {
    return { processedMarkdown: '', isStreaming: false };
  }

  return {
    processedMarkdown: result.processed,
    // Still streaming until the latest markdown has been processed.
    isStreaming: result.source !== markdown,
  };
}
