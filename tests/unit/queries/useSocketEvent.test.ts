import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { resetWindowEventListeners, setupDomGlobals, teardownDomGlobals } from './helpers/domSetup';

vi.mock('$app/common/helpers', () => ({
  isHosted: () => true,
}));

import { useSocketEvent } from '../../../src/common/queries/sockets';

function SocketEventHarness({
  callback,
}: {
  callback: (options: { event: string; data: unknown }) => void;
}) {
  useSocketEvent({
    on: 'App\\Events\\Socket\\RefetchEntity',
    callback,
  });

  return null;
}

describe('useSocketEvent', () => {
  beforeEach(() => {
    setupDomGlobals();
    resetWindowEventListeners();
  });

  afterEach(() => {
    teardownDomGlobals();
    vi.restoreAllMocks();
  });

  test('invokes callback when a matching window socket event is dispatched', () => {
    const callback = vi.fn();
    let renderer: ReactTestRenderer;

    act(() => {
      renderer = create(createElement(SocketEventHarness, { callback }));
    });

    act(() => {
      window.dispatchEvent(
        new CustomEvent('pusher::App\\Events\\Socket\\RefetchEntity', {
          detail: {
            event: 'App\\Events\\Socket\\RefetchEntity',
            data: {
              entity: 'invoices',
              entity_id: 'invoice-id',
            },
          },
        })
      );
    });

    expect(callback).toHaveBeenCalledWith({
      event: 'App\\Events\\Socket\\RefetchEntity',
      data: {
        entity: 'invoices',
        entity_id: 'invoice-id',
      },
    });

    act(() => {
      renderer.unmount();
    });

    act(() => {
      window.dispatchEvent(
        new CustomEvent('pusher::App\\Events\\Socket\\RefetchEntity', {
          detail: {
            event: 'App\\Events\\Socket\\RefetchEntity',
            data: {
              entity: 'invoices',
              entity_id: 'invoice-id',
            },
          },
        })
      );
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });
});
