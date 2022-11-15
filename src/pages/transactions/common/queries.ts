/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { useQuery } from 'react-query';

export function useTransactionQuery(params: { id: string | undefined }) {
  return useQuery(['/api/v1/bank_transactions/:id', { id: params.id }], () =>
    request('GET', endpoint('/api/v1/bank_transactions/:id', { id: params.id }))
  );
}
