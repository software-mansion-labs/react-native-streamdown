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
});
