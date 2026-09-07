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
import { useEffect } from 'react';
import { apiEndpoint, isSelfHosted } from '../helpers';
import { defaultHeaders } from '../queries/common/headers';
import {
  bindSocketConnectionLogging,
  exposeSocketDebug,
  isSocketDebugEnabled,
  logSocketDebug,
} from '../queries/socketLogging';
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

    if (isSocketDebugEnabled()) {
      Pusher.logToConsole = true;
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
    exposeSocketDebug(client);

    const unbindConnectionLogging = bindSocketConnectionLogging(client);

    const onConnected = () => {
      localStorage.setItem('X-SOCKET-ID', client.connection.socket_id);

      logSocketDebug('socket id stored', {
        socketId: client.connection.socket_id,
      });

      setConnections((connections) => [...connections, client]);
    };

    client.connection.bind('connected', onConnected);
    client.connect();

    return () => {
      client.connection.unbind('connected', onConnected);
      unbindConnectionLogging();
      client.disconnect();
    };
  }, [company, reactSettings.preferences.enable_public_notifications]);

  return pusher;
}

export function cleanupStaleSocketConnections(
  connections: Array<{ disconnect: () => void }>
) {
  if (connections.length <= 1) {
    return;
  }

  connections.slice(0, -1).forEach((connection) => {
    connection.disconnect();
  });
}

export function useCleanupConnections() {
  const [connections] = useAtom(connectionsAtom);

  useEffect(() => {
    const timeout = setTimeout(() => {
      cleanupStaleSocketConnections(connections);
    }, 5000);

    return () => clearTimeout(timeout);
  }, [connections]);
}
