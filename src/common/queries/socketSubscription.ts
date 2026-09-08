/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2026. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export interface SocketConnectionLike {
  state: string;
  bind: (event: string, handler: () => void) => void;
  unbind: (event: string, handler: () => void) => void;
}

export interface SocketClientLike {
  connection: SocketConnectionLike;
  connect: () => void;
}

export function subscribeWhenConnected(
  sockets: SocketClientLike,
  setup: () => (() => void) | void
) {
  let teardown: (() => void) | undefined;

  const onConnected = () => {
    teardown?.();
    teardown = setup() ?? undefined;
  };

  if (sockets.connection.state === 'connected') {
    onConnected();
  } else {
    sockets.connection.bind('connected', onConnected);
    sockets.connect();
  }

  return () => {
    sockets.connection.unbind('connected', onConnected);
    teardown?.();
  };
}
