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
import { socketEvents, type SocketEvent } from './socketEvents';
import { logSocketDebug } from './socketLogging';

const callbacks: Record<SocketEvent, (data: unknown) => unknown> = {
  'App\\Events\\Invoice\\InvoiceWasPaid': () => {},
  'App\\Events\\Invoice\\InvoiceWasViewed': () => {},
  'App\\Events\\Payment\\PaymentWasUpdated': () => {},
  'App\\Events\\Credit\\CreditWasCreated': () => {},
  'App\\Events\\Credit\\CreditWasUpdated': () => {},
  'App\\Events\\Socket\\RefetchEntity': () => {},
  'App\\Events\\Socket\\DownloadAvailable': () => {},
  'App\\Events\\Document\\DocumentWasSigned': () => {},
  'App\\Events\\DocumentFile\\DocumentFilePreviewGenerated': () => {},
  'App\\Events\\User\\UserWasVerified': () => {},
};

export function attachPrivateChannelEventHandlers(channel: Channel) {
  const dispatchEvent = (eventName: string, data: unknown) => {
    logSocketDebug(`channel: ${channel.name}: ${eventName}`, data);

    const callback = callbacks[eventName as SocketEvent];

    if (!callback) {
      logSocketDebug(
        `unhandled event on ${channel.name}: ${eventName}`,
        data
      );
      return;
    }

    callback(data);

    window.dispatchEvent(
      new CustomEvent(`pusher::${eventName}`, {
        detail: {
          event: eventName,
          data: data,
        },
      })
    );
  };

  socketEvents.forEach((eventName) => {
    channel.bind(eventName, (data: unknown) => {
      dispatchEvent(eventName, data);
    });
  });

  channel.bind_global((eventName: string, data: unknown) => {
    if (socketEvents.includes(eventName as SocketEvent)) {
      return;
    }

    logSocketDebug(`unhandled event on ${channel.name}: ${eventName}`, data);
  });
}
