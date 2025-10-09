/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useQuery } from 'react-query';
import { Params } from '../common/params.interface';
import { request } from '$app/common/helpers/request';
import { docuNinjaEndpoint } from '$app/common/helpers';
import { GenericQueryOptions } from '../invoices';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { Client, Document, User } from '$app/common/interfaces/docuninja/api';
import { TimelineItemType } from '$app/pages/documents/show/components/TimelineLayout';
import { AxiosResponse } from 'axios';

export function useDocumentsQuery(params: Params) {
  return useQuery(
    ['/api/documents/docuninja', params],
    () =>
      request(
        'GET',
        docuNinjaEndpoint(
          '/api/documents?per_page=:per_page&page=:page&filter=:filter',
          {
            per_page: params.perPage ?? '100',
            page: params.currentPage ?? '1',
            filter: params.filter ?? '',
          }
        ),
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              'X-DOCU-NINJA-TOKEN'
            )}`,
          },
        }
      ),
    { staleTime: Infinity, enabled: true }
  );
}

export function useDocumentQuery({ id, enabled }: GenericQueryOptions) {
  console.log(localStorage.getItem(
    'X-DOCU-NINJA-TOKEN'
  ));

  return useQuery(
    ['/api/documents/docuninja', id],
    () =>
      request(
        'GET',
        docuNinjaEndpoint('/api/documents/:id?includeUrl&includePreviews', {
          id,
        }),
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              'X-DOCU-NINJA-TOKEN'
            )}`,
          },
          skipIntercept: true,
        }
      ).then(
        (response: GenericSingleResourceResponse<Document>) =>
          response.data.data
      ),
    {
      enabled: enabled ?? true,
      staleTime: Infinity,
    }
  );
}

export function useDocumentTimelineQuery({ id, enabled }: GenericQueryOptions) {
  return useQuery(
    ['/api/documents/docuninja/timeline', id],
    () =>
      request(
        'POST',
        docuNinjaEndpoint('/api/documents/:id/timeline', { id }),
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              'X-DOCU-NINJA-TOKEN'
            )}`,
          },
          skipIntercept: true,
        }
      ).then((response: AxiosResponse<TimelineItemType[]>) => response.data),
    {
      enabled: enabled ?? true,
      staleTime: Infinity,
    }
  );
}

export function useUserQuery({ id, enabled }: GenericQueryOptions) {
  return useQuery(
    ['/api/users', id],
    () =>
      request(
        'GET',
        docuNinjaEndpoint('/api/users/:id', { id }),
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              'X-DOCU-NINJA-TOKEN'
            )}`,
          },
        }
      ).then(
        (response: GenericSingleResourceResponse<User>) => response.data.data
      ),
    {
      enabled: enabled ?? true,
      staleTime: Infinity,
    }
  );
}

export function useClientQuery({ id, enabled }: GenericQueryOptions) {
  return useQuery(
    ['/api/clients', id],
    () =>
      request(
        'GET',
        docuNinjaEndpoint('/api/clients/:id', { id }),
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              'X-DOCU-NINJA-TOKEN'
            )}`,
          },
        }
      ).then(
        (response: GenericSingleResourceResponse<Client>) => response.data.data
      ),
    {
      enabled: enabled ?? true,
      staleTime: Infinity,
    }
  );
}
