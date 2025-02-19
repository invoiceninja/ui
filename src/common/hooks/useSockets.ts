/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { atom, useAtom } from 'jotai';
import Pusher from 'pusher-js';
import { defaultHeaders } from '../queries/common/headers';
import { apiEndpoint, isSelfHosted } from '../helpers';
import { useEffect } from 'react';
import { useCurrentCompany } from './useCurrentCompany';
import { useReactSettings } from './useReactSettings';

export const pusherAtom = atom<Pusher | null>(null);
export const connectionsAtom = atom<Pusher[]>([]);

export function useSockets() {
  const [pusher, setPusher] = useAtom(pusherAtom);
  const [, setConnections] = useAtom(connectionsAtom);

  const company = useCurrentCompany();
  const reactSettings = useReactSettings();

  useCleanupConnections();

  useEffect(() => {
    if (!company) {
      return;
    }

    if (
      isSelfHosted() &&
      !reactSettings.preferences.enable_public_notifications
    ) {
      return;
    }

    if (pusher) {
      return;
    }

    const client = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY ?? '', {
      cluster: 'eu',
      authEndpoint: apiEndpoint() + '/broadcasting/auth',
      forceTLS: false,
      wsHost: 'socket.invoicing.co',
      wsPort: 6002,
      enabledTransports: ['ws', 'wss'],
      auth: {
        headers: defaultHeaders(),
      },
      enableStats: false,
      disableStats: true,
    });

    setPusher(client);

    client.connection.bind('connected', () => {
      localStorage.setItem('X-SOCKET-ID', client.connection.socket_id);

      setConnections((connections) => [...connections, client]);
    });

    return () => {
      client.disconnect();
    };
  }, [company, reactSettings.preferences.enable_public_notifications]);

  return pusher;
}

export function useCleanupConnections() {
  const [connections] = useAtom(connectionsAtom);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (connections.length > 1) {
        connections.map((connection) => {
          if (connection === connections[connections.length - 1]) {
            return;
          }

          connection.disconnect();
        });

        // setConnections([connections[connections.length - 1]]);
      }

      return () => clearTimeout(timeout);
    }, 5000);
  }, [connections]);
}
