import { act } from 'react';
import TestRenderer from 'react-test-renderer';
import { StreamdownText } from '../StreamdownText';

// Only packages outside this library are stubbed. StreamdownText, useStreamdownMarkdown
// and remendWorklet all run for real, so each case covers the whole path from prop to
// rendered markdown rather than one unit in isolation.

// Inline literal: this factory is evaluated during the hoisted import of the module
// under test, before any module-scope const has been initialised.
jest.mock('react-native', () => ({ Platform: { OS: 'ios' } }));

const mockScheduleOnRuntime = jest.fn();
const mockScheduleOnRN = jest.fn();

jest.mock('react-native-worklets', () => ({
  createWorkletRuntime: jest.fn(() => ({ __runtime: 'remend' })),
  // Run the scheduled work inline so a test can assert on what finally renders.
  scheduleOnRuntime: (runtime: unknown, work: () => void) => {
    mockScheduleOnRuntime(runtime, work);
    work();
  },
  scheduleOnRN: (fn: (...a: unknown[]) => void, ...args: unknown[]) => {
    mockScheduleOnRN(fn, ...args);
    fn(...args);
  },
}));

// remend ships only an "import" condition, which jest's CommonJS resolver cannot load.
jest.mock(
  'remend',
  () => ({ __esModule: true, default: (md: string) => `remended:${md}` }),
  { virtual: true }
);

const mockRendered: Record<string, unknown>[] = [];
jest.mock('react-native-enriched-markdown', () => ({
  EnrichedMarkdownText: (props: Record<string, unknown>) => {
    mockRendered.push(props);
    return null;
  },
}));

const lastRender = () => mockRendered[mockRendered.length - 1];

function render(element: React.ReactElement) {
  let renderer!: TestRenderer.ReactTestRenderer;
  act(() => {
    renderer = TestRenderer.create(element);
  });
  return renderer;
}

describe('StreamdownText', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRendered.length = 0;
  });

  it('renders processed markdown through the worklet runtime by default', () => {
    render(<StreamdownText markdown="hello" />);

    expect(mockScheduleOnRuntime).toHaveBeenCalledTimes(1);
    expect(lastRender()).toMatchObject({ markdown: 'remended:hello' });
  });

  it('renders processed markdown on the JS thread when forceJsThread is set', () => {
    render(<StreamdownText markdown="hello" forceJsThread />);

    expect(mockScheduleOnRuntime).not.toHaveBeenCalled();
    expect(lastRender()).toMatchObject({ markdown: 'remended:hello' });
  });

  it('keeps forceJsThread out of the underlying markdown view', () => {
    render(<StreamdownText markdown="hello" flavor="github" forceJsThread />);

    expect(lastRender()).not.toHaveProperty('forceJsThread');
    expect(lastRender()).toMatchObject({ flavor: 'github' });
  });

  it('reprocesses the current markdown when forceJsThread changes', () => {
    const renderer = render(<StreamdownText markdown="hello" />);
    expect(mockScheduleOnRuntime).toHaveBeenCalledTimes(1);

    act(() => {
      renderer.update(<StreamdownText markdown="hello" forceJsThread />);
    });

    // Reprocessed, and the second pass skipped the runtime: one scheduleOnRuntime
    // from the first render, two deliveries in total.
    expect(mockScheduleOnRuntime).toHaveBeenCalledTimes(1);
    expect(mockScheduleOnRN).toHaveBeenCalledTimes(2);
  });
});
