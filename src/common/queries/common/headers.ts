/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { isHosted } from '$app/common/helpers';

export function defaultHeaders() {
  const headers: Record<string, unknown> = {
    'X-Api-Token': localStorage.getItem('X-NINJA-TOKEN') as string,
    'X-Requested-With': 'XMLHttpRequest',
    'X-React': 'true',
  };

  if (localStorage.getItem('X-SOCKET-ID') && isHosted()) {
    headers['X-Socket-Id'] = parseInt(
      localStorage.getItem('X-SOCKET-ID') as string
    );
  }

  return headers;
}
