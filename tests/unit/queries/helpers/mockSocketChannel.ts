import { vi } from 'vitest';
import type { Channel } from 'pusher-js';
import type {
  SocketClientLike,
  SocketConnectionLike,
} from '../../../../src/common/queries/socketSubscription';

type ChannelHandler = (data: unknown) => void;
type GlobalHandler = (eventName: string, data: unknown) => void;

export function createMockChannel(name: string) {
  const handlers = new Map<string, ChannelHandler[]>();
  const globalHandlers: GlobalHandler[] = [];

  const channel = {
    name,
    subscribed: false,
    bind: vi.fn((eventName: string, handler: ChannelHandler) => {
      const existing = handlers.get(eventName) ?? [];
      existing.push(handler);
      handlers.set(eventName, existing);
    }),
    bind_global: vi.fn((handler: GlobalHandler) => {
      globalHandlers.push(handler);
    }),
    unbind: vi.fn(),
    unbind_all: vi.fn(() => {
      handlers.clear();
      globalHandlers.length = 0;
    }),
    emit(eventName: string, data: unknown) {
      handlers.get(eventName)?.forEach((handler) => handler(data));
      globalHandlers.forEach((handler) => handler(eventName, data));
    },
    triggerSubscriptionSucceeded() {
      channel.subscribed = true;
      channel.emit('pusher:subscription_succeeded', {});
    },
    triggerSubscriptionError(error: unknown) {
      channel.emit('pusher:subscription_error', error);
    },
  };

  return channel as typeof channel & Channel;
}

export function createMockSocket(initialState: 'connected' | 'disconnected' = 'disconnected') {
  const connectedHandlers: Array<() => void> = [];
  const subscribedChannels = new Map<string, ReturnType<typeof createMockChannel>>();

  const connection: SocketConnectionLike = {
    state: initialState,
    bind: vi.fn((eventName: string, handler: () => void) => {
      if (eventName === 'connected') {
        connectedHandlers.push(handler);
      }
    }),
    unbind: vi.fn((eventName: string, handler: () => void) => {
      if (eventName === 'connected') {
        const index = connectedHandlers.indexOf(handler);

        if (index >= 0) {
          connectedHandlers.splice(index, 1);
        }
      }
    }),
  };

  const sockets = {
    connection,
    connect: vi.fn(() => {
      connection.state = 'connecting';
    }),
    subscribe: vi.fn((channelName: string) => {
      const channel = createMockChannel(channelName);
      subscribedChannels.set(channelName, channel);

      return channel;
    }),
    unsubscribe: vi.fn((channelName: string) => {
      subscribedChannels.delete(channelName);
    }),
    triggerConnected() {
      connection.state = 'connected';
      connectedHandlers.forEach((handler) => handler());
    },
    getChannel(channelName: string) {
      return subscribedChannels.get(channelName);
    },
  };

  return sockets as typeof sockets & SocketClientLike & {
    subscribe: (channelName: string) => ReturnType<typeof createMockChannel>;
    unsubscribe: (channelName: string) => void;
    triggerConnected: () => void;
    getChannel: (channelName: string) => ReturnType<typeof createMockChannel> | undefined;
  };
}
