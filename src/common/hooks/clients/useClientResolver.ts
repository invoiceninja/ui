/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ClientResolver } from '$app/common/helpers/clients/client-resolver';

const clientResolver = new ClientResolver();

export function useClientResolver() {
  return clientResolver;
}
