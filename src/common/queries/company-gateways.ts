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
import { route } from 'common/helpers/route';

export function useCompanyGatewaysQuery() {
  return useQuery(route('/api/v1/company_gateways'), () =>
    request('GET', endpoint('/api/v1/company_gateways'))
  );
}

export function useCompanyGatewayQuery(params: { id: string | undefined }) {
  return useQuery(
    route('/api/v1/company_gateways/:id', { id: params.id }),
    () =>
      request(
        'GET',
        endpoint('/api/v1/company_gateways/:id', { id: params.id })
      ),
    { staleTime: Infinity }
  );
}

export function useBlankCompanyGatewayQuery() {
  return useQuery(
    route('/api/v1/company_gateways/create'),
    () => request('GET', endpoint('/api/v1/company_gateways/create')),
    { staleTime: Infinity }
  );
}
