import { act } from 'react';
import TestRenderer from 'react-test-renderer';
import { useStreamdownMarkdown } from '../hooks/useStreamdownMarkdown';

jest.mock('../worklets/remendWorklet', () => ({
  processRemendInWorklet: jest.fn(
    (markdown: string, onComplete: (r: string) => void) => {
      onComplete(markdown);
    }
  ),
}));

const { processRemendInWorklet } = jest.requireMock(
  '../worklets/remendWorklet'
) as {
  processRemendInWorklet: jest.Mock;
};

function Consumer({ markdown, config }: { markdown: string; config: unknown }) {
  useStreamdownMarkdown(markdown, { remendConfig: config as never });
  return null;
}

describe('useStreamdownMarkdown', () => {
  beforeEach(() => {
    processRemendInWorklet.mockClear();
  });

  it('does not re-run the worklet job on idle re-renders when remendConfig is an inline literal', () => {
    const Parent = ({ markdown }: { markdown: string }) => (
      <Consumer markdown={markdown} config={{ katex: true }} />
    );

    let renderer!: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(<Parent markdown="hi" />);
    });
    expect(processRemendInWorklet).toHaveBeenCalledTimes(1);

    // Idle parent re-renders (same markdown) must not reschedule the job.
    act(() => {
      renderer.update(<Parent markdown="hi" />);
    });
    act(() => {
      renderer.update(<Parent markdown="hi" />);
    });
    expect(processRemendInWorklet).toHaveBeenCalledTimes(1);

    // A markdown change still schedules a new job.
    act(() => {
      renderer.update(<Parent markdown="hi there" />);
    });
    expect(processRemendInWorklet).toHaveBeenCalledTimes(2);
  });

  it('renders once per markdown change and derives isStreaming from the processed result', () => {
    const pending: Array<() => void> = [];
    const runSynchronously = processRemendInWorklet.getMockImplementation();
    processRemendInWorklet.mockImplementation(
      (markdown: string, onComplete: (r: string) => void) => {
        pending.push(() => onComplete(`${markdown}!`));
      }
    );

    const states: Array<{ processedMarkdown: string; isStreaming: boolean }> =
      [];
    const Probe = ({ markdown }: { markdown: string }) => {
      states.push(useStreamdownMarkdown(markdown));
      return null;
    };
    const flushWorklet = () => {
      act(() => {
        pending.splice(0).forEach((complete) => complete());
      });
    };

    let renderer!: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(<Probe markdown="**a" />);
    });
    // No follow-up render from the effect: the only render is the mount.
    expect(states).toEqual([{ processedMarkdown: '', isStreaming: true }]);

    flushWorklet();
    expect(states.at(-1)).toEqual({
      processedMarkdown: '**a!',
      isStreaming: false,
    });

    states.length = 0;
    act(() => {
      renderer.update(<Probe markdown="**ab" />);
    });
    expect(states).toEqual([{ processedMarkdown: '**a!', isStreaming: true }]);

    flushWorklet();
    expect(states.at(-1)).toEqual({
      processedMarkdown: '**ab!',
      isStreaming: false,
    });

    states.length = 0;
    act(() => {
      renderer.update(<Probe markdown="" />);
    });
    expect(states).toEqual([{ processedMarkdown: '', isStreaming: false }]);

    processRemendInWorklet.mockImplementation(runSynchronously);
  });

  it('keeps showing newer results when they arrive after the next change', () => {
    const pending: Array<() => void> = [];
    const runSynchronously = processRemendInWorklet.getMockImplementation();
    processRemendInWorklet.mockImplementation(
      (markdown: string, onComplete: (r: string) => void) => {
        pending.push(() => onComplete(`${markdown}!`));
      }
    );

    let latest!: { processedMarkdown: string; isStreaming: boolean };
    const Probe = ({ markdown }: { markdown: string }) => {
      latest = useStreamdownMarkdown(markdown);
      return null;
    };

    let renderer!: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(<Probe markdown="a" />);
    });
    act(() => {
      renderer.update(<Probe markdown="ab" />);
    });

    // The result for "a" lands after "ab" arrived: still shown, still streaming.
    act(() => {
      pending.shift()?.();
    });
    expect(latest).toEqual({ processedMarkdown: 'a!', isStreaming: true });

    act(() => {
      pending.shift()?.();
    });
    expect(latest).toEqual({ processedMarkdown: 'ab!', isStreaming: false });

    // A result older than the one shown is ignored.
    act(() => {
      renderer.update(<Probe markdown="abc" />);
    });
    act(() => {
      renderer.update(<Probe markdown="abcd" />);
    });
    const [forAbc, forAbcd] = pending.splice(0);
    act(() => {
      forAbcd?.();
    });
    act(() => {
      forAbc?.();
    });
    expect(latest).toEqual({ processedMarkdown: 'abcd!', isStreaming: false });

    // Results from before the markdown was cleared are dropped.
    act(() => {
      renderer.update(<Probe markdown="x" />);
    });
    act(() => {
      renderer.update(<Probe markdown="" />);
    });
    act(() => {
      renderer.update(<Probe markdown="y" />);
    });
    const [forX, forY] = pending.splice(0);
    act(() => {
      forX?.();
    });
    expect(latest).toEqual({ processedMarkdown: 'abcd!', isStreaming: true });
    act(() => {
      forY?.();
    });
    expect(latest).toEqual({ processedMarkdown: 'y!', isStreaming: false });

    processRemendInWorklet.mockImplementation(runSynchronously);
  });
});
