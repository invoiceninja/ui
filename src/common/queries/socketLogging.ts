/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2026. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import type { Channel } from 'pusher-js';
import type Pusher from 'pusher-js';

export const SOCKET_DEBUG_STORAGE_KEY = 'socket_debug';

declare global {
  interface Window {
    __socketDebug?: {
      getState: () => Record<string, unknown>;
      enableDebug: () => void;
      disableDebug: () => void;
    };
  }
}

export function isSocketDebugEnabled(): boolean {
  return localStorage.getItem(SOCKET_DEBUG_STORAGE_KEY) === 'true';
}

export function enableSocketDebug() {
  localStorage.setItem(SOCKET_DEBUG_STORAGE_KEY, 'true');
  console.info(
    '[socket] Debug enabled. Reload the page, then run window.__socketDebug.getState()'
  );
}

export function disableSocketDebug() {
  localStorage.removeItem(SOCKET_DEBUG_STORAGE_KEY);
  console.info('[socket] Debug disabled. Reload the page to apply.');
}

export function logSocketDebug(context: string, data?: unknown) {
  if (!isSocketDebugEnabled()) {
    return;
  }

  if (data === undefined) {
    console.log(`[socket:debug] ${context}`);
    return;
  }

  console.log(`[socket:debug] ${context}:`, data);
}

export function logSocketError(context: string, error: unknown) {
  if (error instanceof Error) {
    console.error(`[socket] ${context}:`, error.message, error);
    return;
  }

  console.error(`[socket] ${context}:`, error);
}

export function exposeSocketDebug(client: Pusher) {
  if (typeof window === 'undefined') {
    return;
  }

  window.__socketDebug = {
    getState: () => ({
      debugEnabled: isSocketDebugEnabled(),
      connectionState: client.connection.state,
      socketId: client.connection.socket_id,
      channels: client.allChannels().map((channel) => ({
        name: channel.name,
        subscribed: channel.subscribed,
      })),
    }),
    enableDebug: enableSocketDebug,
    disableDebug: disableSocketDebug,
  };

  logSocketDebug('window.__socketDebug is available');
}

export function bindSocketConnectionLogging(client: Pusher) {
  const { connection } = client;

  const onError = (error: unknown) => {
    logSocketError('connection error', error);
  };

  const onFailed = () => {
    logSocketError('connection failed', {
      state: connection.state,
      socketId: connection.socket_id,
    });
  };

  const onUnavailable = () => {
    logSocketError('connection unavailable', {
      state: connection.state,
      socketId: connection.socket_id,
    });
  };

  const onStateChange = (states: { previous: string; current: string }) => {
    logSocketDebug('connection state change', states);

    if (states.current === 'failed' || states.current === 'unavailable') {
      logSocketError(
        `connection state change: ${states.previous} -> ${states.current}`,
        states
      );
    }
  };

  const onConnected = () => {
    logSocketDebug('connected', {
      socketId: connection.socket_id,
      state: connection.state,
    });
  };

  const onDisconnected = () => {
    logSocketDebug('disconnected', {
      socketId: connection.socket_id,
      state: connection.state,
    });
  };

  const onMessage = (event: {
    event: string;
    channel?: string;
    data: unknown;
  }) => {
    if (event.event.startsWith('pusher_internal:')) {
      return;
    }

    logSocketDebug(
      `message received: ${event.channel ?? 'unknown-channel'}: ${event.event}`,
      event.data
    );
  };

  connection.bind('connected', onConnected);
  connection.bind('disconnected', onDisconnected);
  connection.bind('error', onError);
  connection.bind('failed', onFailed);
  connection.bind('unavailable', onUnavailable);
  connection.bind('state_change', onStateChange);
  connection.bind('message', onMessage);

  return () => {
    connection.unbind('connected', onConnected);
    connection.unbind('disconnected', onDisconnected);
    connection.unbind('error', onError);
    connection.unbind('failed', onFailed);
    connection.unbind('unavailable', onUnavailable);
    connection.unbind('state_change', onStateChange);
    connection.unbind('message', onMessage);
  };
}

export function bindChannelLogging(channel: Channel) {
  const onSubscriptionSucceeded = () => {
    logSocketDebug(`subscribed to ${channel.name}`, {
      subscribed: channel.subscribed,
    });
  };

  const onSubscriptionError = (error: unknown) => {
    logSocketError(`subscription error on ${channel.name}`, error);
  };

  channel.bind('pusher:subscription_succeeded', onSubscriptionSucceeded);
  channel.bind('pusher:subscription_error', onSubscriptionError);

  return () => {
    channel.unbind('pusher:subscription_succeeded', onSubscriptionSucceeded);
    channel.unbind('pusher:subscription_error', onSubscriptionError);
  };
}
