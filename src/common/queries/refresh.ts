/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint, fetcher } from 'common/helpers';
import useSWR from 'swr';

export function useRefreshQuery() {
  return useSWR(endpoint('/api/v1/refresh'), () =>
    fetcher(endpoint('/api/v1/refresh'), {}, 'POST')
  );
}
