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
import { AxiosResponse } from 'axios';
import { docuNinjaEndpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { Client, Document, User } from '$app/common/interfaces/docuninja/api';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { TimelineItemType } from '$app/pages/documents/show/components/TimelineLayout';
import { Params } from '../common/params.interface';
import { GenericQueryOptions } from '../invoices';

export function useDocumentsQuery(params: Params) {
  return useQuery({
    queryKey: ['/api/documents/docuninja', params],

    queryFn: () =>
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

    staleTime: Infinity,
    enabled: true,
  });
}

export function useDocumentQuery({ id, enabled }: GenericQueryOptions) {
  return useQuery({
    queryKey: ['/api/documents/docuninja', id],

    queryFn: () =>
      request(
        'GET',
        docuNinjaEndpoint(
          '/api/documents/:id?includeUrl&includePreviews&includeUser',
          {
            id,
          }
        ),
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

    enabled: enabled ?? true,
    staleTime: Infinity,
  });
}

export function useDocumentTimelineQuery({ id, enabled }: GenericQueryOptions) {
  return useQuery({
    queryKey: ['/api/documents/docuninja/timeline', id],

    queryFn: () =>
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

    enabled: enabled ?? true,
    staleTime: Infinity,
  });
}

export function useUserQuery({ id, enabled }: GenericQueryOptions) {
  return useQuery({
    queryKey: ['/api/users', id],

    queryFn: () =>
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

    enabled: enabled ?? true,
    staleTime: Infinity,
  });
}

export function useClientQuery({ id, enabled }: GenericQueryOptions) {
  return useQuery({
    queryKey: ['/api/clients', id],

    queryFn: () =>
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

    enabled: enabled ?? true,
    staleTime: Infinity,
  });
}
