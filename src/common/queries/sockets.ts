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
import { $refetch } from '../hooks/useRefetch';

// This file defines global events system for query invalidation.

export const events = ['App\\Events\\Invoice\\InvoiceWasPaid'] as const;

export type Event = (typeof events)[number];

export type Callbacks = Record<Event, (data: unknown) => unknown>;

export function useGlobalSocketEvents() {
  const sockets = useSockets();
  const company = useCurrentCompany();

  const callbacks: Callbacks = {
    'App\\Events\\Invoice\\InvoiceWasPaid': () => $refetch(['invoices']),
  };

  useEffect(() => {
    if (!sockets || !company) {
      return;
    }

    const channel = sockets.subscribe(`private-company-${company.company_key}`);

    channel.bind_global((eventName: Event, data: unknown) => {
      console.log(`channel: ${eventName}`);

      const callback = callbacks[eventName];

      if (callback) {
        callback(data);

        window.dispatchEvent(
          new CustomEvent(`pusher::${eventName}`, {
            detail: data,
          })
        );
      }
    });
  }, [sockets, company]);

  return null;
}

export interface SocketEventProps<T> {
  on: Event | Event[];
  callback: (data: T) => unknown;
}

export function useSocketEvent<T>({ on, callback }: SocketEventProps<T>) {
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const eventHandler = (event: CustomEvent<T>) => {
      if (!signal.aborted) {
        callback(event.detail);
      }
    };

    const events = Array.isArray(on) ? on : [on];

    events.forEach((eventName) => {
      const handlerWithSignal = (event: CustomEvent<T>) => {
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
