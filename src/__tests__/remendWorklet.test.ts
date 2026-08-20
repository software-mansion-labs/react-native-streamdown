// Stable, mutable Platform the mock factory closes over. jest.isolateModules
// re-requires react-native on every load, so a plain outer mutation wouldn't
// reach the module — this shared object does.
const mockPlatform: { OS: string } = { OS: 'ios' };
jest.mock('react-native', () => ({ Platform: mockPlatform }));

jest.mock('react-native-worklets', () => ({
  createWorkletRuntime: jest.fn(() => ({ __runtime: 'remend' })),
  scheduleOnRuntime: jest.fn(),
  scheduleOnRN: jest.fn(
    (fn: (...args: unknown[]) => void, ...args: unknown[]) => fn(...args)
  ),
}));

// Stable ref so assertions hit the same fn the isolated module imports (the
// jest.mock factory re-runs under jest.isolateModules, but closes over this).
const mockRemend = jest.fn((markdown: string) => `remended:${markdown}`);

// Virtual mock: remend's package.json exposes only an "import" condition, which
// jest's CommonJS resolver can't load — and the test only needs the stub anyway.
jest.mock('remend', () => ({ __esModule: true, default: mockRemend }), {
  virtual: true,
});

const worklets = jest.requireMock('react-native-worklets') as {
  createWorkletRuntime: jest.Mock;
  scheduleOnRuntime: jest.Mock;
  scheduleOnRN: jest.Mock;
};

// Load a fresh copy of the module under a given platform. The web/native branch
// is decided at module load (the runtime is created — or not — at import time),
// so each case needs an isolated require.
function loadModule(os: string) {
  mockPlatform.OS = os;
  let mod!: typeof import('../worklets/remendWorklet');
  jest.isolateModules(() => {
    mod = require('../worklets/remendWorklet');
  });
  return mod;
}

describe('remendWorklet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPlatform.OS = 'ios';
  });

  it('does not create a worklet runtime at module load on web', () => {
    // Regression test for #27: createWorkletRuntime is a throwing stub on
    // react-native-web, so touching it at import time crashed the bundle.
    loadModule('web');
    expect(worklets.createWorkletRuntime).not.toHaveBeenCalled();
  });

  it('creates a worklet runtime at module load on native', () => {
    loadModule('ios');
    expect(worklets.createWorkletRuntime).toHaveBeenCalledTimes(1);
  });

  it('runs remend on the JS thread and delivers via scheduleOnRN on web', () => {
    const { processRemendInWorklet } = loadModule('web');
    const onComplete = jest.fn();

    processRemendInWorklet('hello', onComplete);

    expect(mockRemend).toHaveBeenCalledWith(
      'hello',
      expect.objectContaining({ bold: true })
    );
    expect(worklets.scheduleOnRuntime).not.toHaveBeenCalled();
    expect(worklets.scheduleOnRN).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith('remended:hello');
  });

  it('merges the caller config over the defaults on web', () => {
    const { processRemendInWorklet } = loadModule('web');

    processRemendInWorklet('hi', jest.fn(), { katex: true });

    expect(mockRemend).toHaveBeenCalledWith(
      'hi',
      expect.objectContaining({ katex: true, bold: true })
    );
  });

  it('schedules remend on the worklet runtime on native', () => {
    const { processRemendInWorklet } = loadModule('ios');

    processRemendInWorklet('hello', jest.fn());

    expect(worklets.scheduleOnRuntime).toHaveBeenCalledTimes(1);
    expect(worklets.scheduleOnRN).not.toHaveBeenCalled();
  });
});
