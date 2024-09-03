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
import { apiEndpoint, isHosted } from '../helpers';
import { useEffect } from 'react';

export const pusherAtom = atom<Pusher | null>(null);

export function useSockets() {
  const [, setPusher] = useAtom(pusherAtom);

  const client = new Pusher(import.meta.env.VITE_PUSHER_APP_ID, {
    cluster: 'eu',
    authEndpoint: apiEndpoint() + '/broadcasting/auth',
    forceTLS: false,
    enableStats: true,
    wsHost: isHosted()
      ? 'socket.invoicing.co'
      : import.meta.env.VITE_PUSHER_URL,
    wsPort: isHosted() ? 6002 : parseInt(import.meta.env.VITE_PUSHER_PORT),
    enabledTransports: ['ws', 'wss'],
    auth: {
      headers: defaultHeaders(),
    },
  });

  useEffect(() => {
    setPusher(client);
  }, []);

  return client;
}
