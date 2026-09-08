import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { setupDomGlobals, teardownDomGlobals } from './helpers/domSetup';
import { createMockSocket } from './helpers/mockSocketChannel';

const socketState = vi.hoisted(() => ({
  sockets: null as ReturnType<typeof createMockSocket> | null,
  company: {
    company_key: 'company-key',
  },
  account: {
    key: 'account-key',
  },
  user: {
    id: 'hashed-user-id',
  },
}));

vi.mock('$app/common/helpers', () => ({
  isHosted: () => true,
}));

vi.mock('$app/common/hooks/useSockets', () => ({
  useSockets: () => socketState.sockets,
}));

vi.mock('$app/common/hooks/useCurrentCompany', () => ({
  useCurrentCompany: () => socketState.company,
}));

vi.mock('$app/common/hooks/useCurrentAccount', () => ({
  useCurrentAccount: () => socketState.account,
}));

vi.mock('$app/common/hooks/useCurrentUser', () => ({
  useCurrentUser: () => socketState.user,
}));

import { usePrivateSocketEvents } from '../../../src/common/queries/sockets';

function PrivateSocketEventsHarness() {
  usePrivateSocketEvents();

  return null;
}

describe('usePrivateSocketEvents', () => {
  beforeEach(() => {
    setupDomGlobals();
    socketState.sockets = createMockSocket('disconnected');
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    teardownDomGlobals();
    vi.restoreAllMocks();
  });

  test('subscribes to company and user channels after the socket connects', () => {
    let renderer: ReactTestRenderer;

    act(() => {
      renderer = create(createElement(PrivateSocketEventsHarness));
    });

    expect(socketState.sockets?.connect).toHaveBeenCalledTimes(1);
    expect(socketState.sockets?.subscribe).not.toHaveBeenCalled();

    act(() => {
      socketState.sockets?.triggerConnected();
    });

    expect(socketState.sockets?.subscribe).toHaveBeenCalledWith(
      'private-company-company-key'
    );
    expect(socketState.sockets?.subscribe).toHaveBeenCalledWith(
      'private-user-account-key-hashed-user-id'
    );

    act(() => {
      renderer.unmount();
    });

    expect(socketState.sockets?.unsubscribe).toHaveBeenCalledWith(
      'private-company-company-key'
    );
    expect(socketState.sockets?.unsubscribe).toHaveBeenCalledWith(
      'private-user-account-key-hashed-user-id'
    );
  });

  test('does not subscribe when hosted sockets are unavailable', () => {
    socketState.sockets = null;

    expect(() => {
      act(() => {
        create(createElement(PrivateSocketEventsHarness));
      });
    }).not.toThrow();
  });
});
