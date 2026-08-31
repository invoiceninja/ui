import { describe, expect, test, vi } from 'vitest';
import { cleanupStaleSocketConnections } from '../../../src/common/hooks/useSockets';

describe('cleanupStaleSocketConnections', () => {
  test('does nothing when there is a single connection', () => {
    const disconnect = vi.fn();

    cleanupStaleSocketConnections([{ disconnect }]);

    expect(disconnect).not.toHaveBeenCalled();
  });

  test('does nothing when there are no connections', () => {
    expect(() => cleanupStaleSocketConnections([])).not.toThrow();
  });

  test('disconnects all but the most recent connection', () => {
    const first = { disconnect: vi.fn() };
    const second = { disconnect: vi.fn() };
    const third = { disconnect: vi.fn() };

    cleanupStaleSocketConnections([first, second, third]);

    expect(first.disconnect).toHaveBeenCalledTimes(1);
    expect(second.disconnect).toHaveBeenCalledTimes(1);
    expect(third.disconnect).not.toHaveBeenCalled();
  });
});
