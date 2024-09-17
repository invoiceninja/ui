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
import { apiEndpoint } from '../helpers';
import { useEffect } from 'react';

export const pusherAtom = atom<Pusher | null>(null);

export function useSockets() {
  const [pusher, setPusher] = useAtom(pusherAtom);

  useEffect(() => {
    const client = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
      cluster: 'eu',
      authEndpoint: apiEndpoint() + '/broadcasting/auth',
      forceTLS: false,
      enableStats: true,
      wsHost: import.meta.env.VITE_PUSHER_URL ?? 'socket.invoicing.co',
      wsPort: import.meta.env.VITE_PUSHER_PORT
        ? parseInt(import.meta.env.VITE_PUSHER_PORT)
        : 6002,
      enabledTransports: ['ws', 'wss'],
      auth: {
        headers: defaultHeaders(),
      },
    });

    setPusher(client);
  }, []);

  return pusher;
}
