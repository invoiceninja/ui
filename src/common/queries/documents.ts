/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useQuery } from 'react-query';
import { Params } from './common/params.interface';
import { toast } from '../helpers/toast/toast';

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

export const useDocumentsBulk = () => {
  return (ids: string[], action: 'download') => {
    toast.processing();

    request('POST', endpoint('/api/v1/documents/bulk?per_page=100'), {
      action,
      ids,
    }).then(() => toast.success('exported_data'));
  };
};

export const useSetDocumentPublic = () => {
  return async (id: string) => {
    toast.processing();

    return request('PUT', endpoint('/api/v1/documents/:id', { id }), {
      is_public: true,
    }).then(() => toast.success('success'));
  };
};

export const useSetDocumentPrivate = () => {
  return async (id: string) => {
    toast.processing();

    return request('PUT', endpoint('/api/v1/documents/:id', { id }), {
      is_public: false,
    }).then(() => toast.success('success'));
  };
};
