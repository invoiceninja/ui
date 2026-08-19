import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { resetWindowEventListeners, setupDomGlobals, teardownDomGlobals } from './helpers/domSetup';
import { attachPrivateChannelEventHandlers } from '../../../src/common/queries/socketChannelHandlers';
import { createMockChannel } from './helpers/mockSocketChannel';

describe('attachPrivateChannelEventHandlers', () => {
  beforeEach(() => {
    setupDomGlobals();
    resetWindowEventListeners();
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    teardownDomGlobals();
    vi.restoreAllMocks();
  });

  test('binds each registered socket event on the channel', () => {
    const channel = createMockChannel('private-company-company-key');

    attachPrivateChannelEventHandlers(channel);

    expect(channel.bind).toHaveBeenCalledWith(
      'App\\Events\\Socket\\DownloadAvailable',
      expect.any(Function)
    );
    expect(channel.bind).toHaveBeenCalledWith(
      'App\\Events\\Socket\\RefetchEntity',
      expect.any(Function)
    );
    expect(channel.bind_global).toHaveBeenCalledTimes(1);
  });

  test('dispatches window events for known socket events', () => {
    const channel = createMockChannel('private-user-account-key-user-id');
    const listener = vi.fn();

    window.addEventListener(
      'pusher::App\\Events\\Socket\\DownloadAvailable',
      listener as EventListener
    );

    attachPrivateChannelEventHandlers(channel);

    const payload = {
      message: 'Export ready',
      url: 'https://example.com/download',
    };

    channel.emit('App\\Events\\Socket\\DownloadAvailable', payload);

    expect(listener).toHaveBeenCalledTimes(1);

    const event = listener.mock.calls[0][0] as CustomEvent;

    expect(event.detail).toEqual({
      event: 'App\\Events\\Socket\\DownloadAvailable',
      data: payload,
    });

    window.removeEventListener(
      'pusher::App\\Events\\Socket\\DownloadAvailable',
      listener as EventListener
    );
  });

  test('does not dispatch window events for unknown socket events', () => {
    const channel = createMockChannel('private-company-company-key');
    const listener = vi.fn();

    window.addEventListener(
      'pusher::App\\Events\\Socket\\UnknownEvent',
      listener as EventListener
    );

    attachPrivateChannelEventHandlers(channel);
    channel.emit('App\\Events\\Socket\\UnknownEvent', { ok: true });

    expect(listener).not.toHaveBeenCalled();

    window.removeEventListener(
      'pusher::App\\Events\\Socket\\UnknownEvent',
      listener as EventListener
    );
  });
});
