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
import { Params } from './common/params.interface';

export function useDocumentsQuery(params: Params) {
  return useQuery(['/api/v1/documents', params], () =>
    request(
      'GET',
      endpoint(
        '/api/v1/documents?per_page=:perPage&page=:currentPage&company_documents=:companyDocuments',
        {
          perPage: params.perPage,
          currentPage: params.currentPage,
          companyDocuments: params.companyDocuments ?? 'false',
        }
      )
    )
  );
}
