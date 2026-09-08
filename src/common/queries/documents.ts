/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useQuery } from '@tanstack/react-query';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '../helpers/toast/toast';
import { Params } from './common/params.interface';

export function useDocumentsQuery(params: Params) {
  return useQuery({
    queryKey: ['/api/v1/documents', params],

    queryFn: () =>
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
      ),

    staleTime: Infinity,
  });
}

export const useDocumentsBulk = () => {
  return (ids: string[], action: 'download') => {
    toast.processing();

    request('POST', endpoint('/api/v1/documents/bulk?per_page=100'), {
      action,
      ids,
    }).then(() => toast.success('exported_data'));
  };
};

export const useSetDocumentVisibility = () => {
  return async (id: string, visible: boolean) => {
    toast.processing();

    return request('PUT', endpoint('/api/v1/documents/:id', { id }), {
      is_public: visible,
    }).then(() => toast.success('success'));
  };
};
