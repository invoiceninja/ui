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

export function useSockets() {
  const [pusher, setPusher] = useAtom(pusherAtom);

  const company = useCurrentCompany();
  const reactSettings = useReactSettings();

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
    });

    return () => {
      client.disconnect();
    };
  }, [company, reactSettings.preferences.enable_public_notifications]);

  return pusher;
}
