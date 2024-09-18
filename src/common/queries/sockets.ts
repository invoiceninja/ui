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

type Callbacks = Record<string, (data: unknown) => unknown>;

export function useGlobalSocketEvents() {
  const sockets = useSockets();
  const company = useCurrentCompany();

  const callbacks: Callbacks = {
    'client.archived': () => console.log('Client was archived'),
    'invoice.paid': () => {
      $refetch(['invoices']);
    },
  };

  useEffect(() => {
    if (!sockets || !company) {
      return;
    }

    const channel = sockets.subscribe(`private-company-${company.company_key}`);

    channel.bind_global((eventName: string, data: unknown) => {
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
  name: string;
  callback: (data: T) => unknown;
}

export function useSocketEvent<T>({ name, callback }: SocketEventProps<T>) {
  useEffect(() => {
    const eventHandler = (event: CustomEvent<T>) => {
      callback(event.detail);
      console.log({ name });
    };

    window.addEventListener(`pusher::${name}`, eventHandler as EventListener);

    return () => {
      window.removeEventListener(
        `pusher::${name}`,
        eventHandler as EventListener
      );
    };
  }, [name, callback]);
}
