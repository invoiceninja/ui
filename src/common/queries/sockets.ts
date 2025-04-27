/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useSockets } from '../hooks/useSockets';
import { useEffect } from 'react';
import { useCurrentCompany } from '../hooks/useCurrentCompany';
import { isHosted } from '../helpers';

// This file defines global events system for query invalidation.

export const events = [
  'App\\Events\\Invoice\\InvoiceWasPaid',
  'App\\Events\\Invoice\\InvoiceWasViewed',
  'App\\Events\\Payment\\PaymentWasUpdated',
  'App\\Events\\Credit\\CreditWasCreated',
  'App\\Events\\Credit\\CreditWasUpdated',
  'App\\Events\\Socket\\RefreshEntity',
] as const;

export type Event = (typeof events)[number];

export type Callbacks = Record<Event, (data: unknown) => unknown>;

export function usePrivateSocketEvents() {
  const sockets = useSockets();
  const company = useCurrentCompany();

  const callbacks: Callbacks = {
    'App\\Events\\Invoice\\InvoiceWasPaid': () => {},
    'App\\Events\\Invoice\\InvoiceWasViewed': () => {},
    'App\\Events\\Payment\\PaymentWasUpdated': () => {},
    'App\\Events\\Credit\\CreditWasCreated': () => {},
    'App\\Events\\Credit\\CreditWasUpdated': () => {},
    'App\\Events\\Socket\\RefreshEntity': () => {},
  };

  useEffect(() => {
    if (!sockets || !company || !isHosted()) {
      return;
    }

    console.log(`Subscribing to private-company-${company.company_key}`);

    const channel = sockets.subscribe(`private-company-${company.company_key}`);

    channel.bind_global((eventName: Event, data: unknown) => {
      console.log(`channel: ${eventName}`);

      const callback = callbacks[eventName];

      if (callback) {
        callback(data);

        window.dispatchEvent(
          new CustomEvent(`pusher::${eventName}`, {
            detail: {
              event: eventName,
              data: data,
            },
          })
        );
      }
    });
  }, [sockets, company]);

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
