/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Client } from '$app/common/interfaces/client';
import { Settings } from '$app/common/interfaces/company.interface';

export const withoutBlankSetting = (
  client: Client | undefined,
  key: keyof Settings
): Client | undefined => {
  if (!client) {
    return client;
  }

  const value = client.settings?.[key];

  return value === '' || value === null
    ? { ...client, settings: { ...client.settings, [key]: undefined } }
    : client;
};
