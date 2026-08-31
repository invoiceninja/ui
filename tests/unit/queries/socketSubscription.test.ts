import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { subscribeWhenConnected } from '../../../src/common/queries/socketSubscription';
import { createMockSocket } from './helpers/mockSocketChannel';

describe('subscribeWhenConnected', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('subscribes immediately when already connected', () => {
    const sockets = createMockSocket('connected');
    const setup = vi.fn(() => vi.fn());

    const cleanup = subscribeWhenConnected(sockets, setup);

    expect(setup).toHaveBeenCalledTimes(1);
    expect(sockets.connect).not.toHaveBeenCalled();
    expect(sockets.connection.bind).not.toHaveBeenCalled();

    cleanup();
  });

  test('waits for connected before subscribing', () => {
    const sockets = createMockSocket('disconnected');
    const setup = vi.fn(() => vi.fn());

    const cleanup = subscribeWhenConnected(sockets, setup);

    expect(setup).not.toHaveBeenCalled();
    expect(sockets.connect).toHaveBeenCalledTimes(1);
    expect(sockets.connection.bind).toHaveBeenCalledWith(
      'connected',
      expect.any(Function)
    );

    sockets.triggerConnected();

    expect(setup).toHaveBeenCalledTimes(1);

    cleanup();
  });

  test('replaces previous subscriptions when connected fires again', () => {
    const sockets = createMockSocket('disconnected');
    const firstTeardown = vi.fn();
    const secondTeardown = vi.fn();
    const setup = vi
      .fn()
      .mockReturnValueOnce(firstTeardown)
      .mockReturnValueOnce(secondTeardown);

    subscribeWhenConnected(sockets, setup);

    sockets.triggerConnected();
    sockets.triggerConnected();

    expect(firstTeardown).toHaveBeenCalledTimes(1);
    expect(secondTeardown).not.toHaveBeenCalled();
    expect(setup).toHaveBeenCalledTimes(2);
  });

  test('cleans up connected listener and active subscriptions', () => {
    const sockets = createMockSocket('connected');
    const teardown = vi.fn();
    const setup = vi.fn(() => teardown);

    const cleanup = subscribeWhenConnected(sockets, setup);
    cleanup();

    expect(teardown).toHaveBeenCalledTimes(1);
    expect(sockets.connection.unbind).toHaveBeenCalledWith(
      'connected',
      expect.any(Function)
    );
  });
});
