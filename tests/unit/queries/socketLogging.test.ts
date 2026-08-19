import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import {
  SOCKET_DEBUG_STORAGE_KEY,
  isSocketDebugEnabled,
  logSocketDebug,
  logSocketError,
} from '../../../src/common/queries/socketLogging';

function createLocalStorageMock() {
  const store = new Map<string, string>();

  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };
}

describe('socketLogging', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createLocalStorageMock());
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('isSocketDebugEnabled reflects localStorage flag', () => {
    expect(isSocketDebugEnabled()).toBe(false);

    localStorage.setItem(SOCKET_DEBUG_STORAGE_KEY, 'true');

    expect(isSocketDebugEnabled()).toBe(true);
  });

  test('logSocketDebug is silent unless debug is enabled', () => {
    logSocketDebug('hidden message', { value: 1 });

    expect(console.log).not.toHaveBeenCalled();

    localStorage.setItem(SOCKET_DEBUG_STORAGE_KEY, 'true');

    logSocketDebug('visible message', { value: 2 });

    expect(console.log).toHaveBeenCalledWith(
      '[socket:debug] visible message:',
      { value: 2 }
    );
  });

  test('logSocketError always logs connection and subscription failures', () => {
    logSocketError('subscription error on private-user-abc-1', {
      type: 'AuthError',
      error: 'Forbidden',
    });

    expect(console.error).toHaveBeenCalledWith(
      '[socket] subscription error on private-user-abc-1:',
      {
        type: 'AuthError',
        error: 'Forbidden',
      }
    );
  });

  test('logSocketError includes Error message and object', () => {
    const error = new Error('websocket failed');

    logSocketError('connection error', error);

    expect(console.error).toHaveBeenCalledWith(
      '[socket] connection error:',
      'websocket failed',
      error
    );
  });
});

describe('bindChannelLogging', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('logs subscription errors through logSocketError', async () => {
    const { bindChannelLogging } = await import(
      '../../../src/common/queries/socketLogging'
    );
    const { createMockChannel } = await import('./helpers/mockSocketChannel');

    const channel = createMockChannel('private-user-account-key-user-id');
    const unbind = bindChannelLogging(channel);

    channel.triggerSubscriptionError({
      type: 'AuthError',
      error: 'Forbidden',
    });

    expect(console.error).toHaveBeenCalledWith(
      '[socket] subscription error on private-user-account-key-user-id:',
      {
        type: 'AuthError',
        error: 'Forbidden',
      }
    );

    unbind();
  });
});
