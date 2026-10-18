/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2026. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect } from 'react';
import type { Channel } from 'pusher-js';
import { isHosted } from '../helpers';
import { useCurrentAccount } from '../hooks/useCurrentAccount';
import { useCurrentCompany } from '../hooks/useCurrentCompany';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useSockets } from '../hooks/useSockets';
import { attachPrivateChannelEventHandlers } from './socketChannelHandlers';
import { socketEvents, type SocketEvent } from './socketEvents';
import { bindChannelLogging, logSocketDebug } from './socketLogging';
import { subscribeWhenConnected } from './socketSubscription';

// This file defines global events system for query invalidation.

export const events = socketEvents;
export type Event = SocketEvent;
export type Callbacks = Record<Event, (data: unknown) => unknown>;

export function buildPrivateChannelNames(options: {
  companyKey?: string;
  accountKey?: string;
  userId?: string;
}): string[] {
  const channelNames: string[] = [];

  if (options.companyKey) {
    channelNames.push(`private-company-${options.companyKey}`);
  }

  if (options.accountKey && options.userId) {
    channelNames.push(`private-user-${options.accountKey}-${options.userId}`);
  }

  return channelNames;
}

export function buildGeneralChannelName(hosted: boolean): string {
  return hosted ? 'general_hosted' : 'general_selfhosted';
}

export function usePrivateSocketEvents() {
  const sockets = useSockets();
  const company = useCurrentCompany();
  const account = useCurrentAccount();
  const user = useCurrentUser();

  useEffect(() => {
    if (!sockets || !isHosted()) {
      return;
    }

    return subscribeWhenConnected(sockets, () => {
      const channels: Channel[] = [];
      const unbindChannelLogging: Array<() => void> = [];

      logSocketDebug('setting up private channels', {
        connectionState: sockets.connection.state,
        socketId: sockets.connection.socket_id,
        companyKey: company?.company_key,
        accountKey: account?.key,
        userId: user?.id,
      });

      buildPrivateChannelNames({
        companyKey: company?.company_key,
        accountKey: account?.key,
        userId: user?.id,
      }).forEach((channelName) => {
        logSocketDebug(`subscribing to ${channelName}`);

        const channel = sockets.subscribe(channelName);

        unbindChannelLogging.push(bindChannelLogging(channel));
        channels.push(channel);
      });

      if (channels.length === 0) {
        return;
      }

      channels.forEach((channel) => attachPrivateChannelEventHandlers(channel));

      return () => {
        unbindChannelLogging.forEach((unbind) => unbind());

        channels.forEach((channel) => {
          channel.unbind_all();
          sockets.unsubscribe(channel.name);
        });
      };
    });
  }, [sockets, company?.company_key, account?.key, user?.id]);

  return null;
}

export interface CallbackOptions<T> {
  event: Event;
  data: T;
}

export interface SocketEventProps<T> {
  on: Event | Event[];
  callback: (options: CallbackOptions<T>) => unknown;
}

export type WithSocketId<T> = T & { 'x-socket-id': string };

export function useSocketEvent<T>({ on, callback }: SocketEventProps<T>) {
  useEffect(() => {
    if (!isHosted()) {
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    const eventHandler = (event: CustomEvent<CallbackOptions<T>>) => {
      if (!signal.aborted) {
        callback({
          event: event.detail.event,
          data: event.detail.data,
        });
      }
    };

    const events = Array.isArray(on) ? on : [on];

    events.forEach((eventName) => {
      const handlerWithSignal = (event: CustomEvent<CallbackOptions<T>>) => {
        if (!signal.aborted) {
          eventHandler(event);
        }
      };

      window.addEventListener(
        `pusher::${eventName}`,
        handlerWithSignal as EventListener
      );

      signal.addEventListener('abort', () => {
        window.removeEventListener(
          `pusher::${eventName}`,
          handlerWithSignal as EventListener
        );
      });
    });

    return () => {
      controller.abort();
    };
  }, [on, callback]);
}

export function socketId() {
  if (localStorage.getItem('X-SOCKET-ID')) {
    return parseFloat(localStorage.getItem('X-SOCKET-ID') as string);
  }

  return null;
}

export interface GenericMessage {
  message: string;
  link: string | null;
}

export interface DownloadAvailable {
  message: string;
  url: string;
}
