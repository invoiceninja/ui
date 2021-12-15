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
import { Params } from './common/params.interface';

export function useDocumentsQuery(params: Params) {
  return useSWR(
    endpoint('/api/v1/documents?per_page=:perPage&page=:currentPage', {
      perPage: params.perPage,
      currentPage: params.currentPage,
    }),
    fetcher
  );
}
