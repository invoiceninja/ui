/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import { invalidationQueryAtom } from '$app/common/atoms/data-table';
import { docuNinjaEndpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { Params } from '../common/params.interface';

export function useUsersQuery(params: Params) {
  return useQuery({
    queryKey: ['/api/users', params],

    queryFn: () =>
      request(
        'GET',
        docuNinjaEndpoint(
          '/api/users?per_page=:per_page&page=:page&search=:search&ninjaCompanyKey=:ninjaCompanyKey&ninjaAccountKey=:ninjaAccountKey',
          {
            per_page: params.perPage ?? '10',
            page: params.currentPage ?? '1',
            search: params.search ?? '',
            ninjaCompanyKey: params.ninjaCompanyKey ?? '',
            ninjaAccountKey: params.ninjaAccountKey ?? '',
            status: params.status ?? 'active',
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

export function useBlankDocuNinjaUserQuery() {
  return useQuery({
    queryKey: ['/api/users/docuninja/blank'],

    queryFn: () =>
      request(
        'GET',
        docuNinjaEndpoint('/api/users/create'),
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              'X-DOCU-NINJA-TOKEN'
            )}`,
          },
        }
      ).then((res) => res.data.data),

    staleTime: Infinity,
  });
}

interface UserParams {
  id: string | undefined;
}

export function useDocuNinjaUserQuery(params: UserParams) {
  return useQuery({
    queryKey: ['/api/users', params],

    queryFn: () =>
      request(
        'GET',
        docuNinjaEndpoint('/api/users/:id', {
          id: params.id,
        }),
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              'X-DOCU-NINJA-TOKEN'
            )}`,
          },
        }
      ).then((res) => res.data.data),

    staleTime: Infinity,
    enabled: Boolean(params.id),
  });
}

export function useBulk() {
  const queryClient = useQueryClient();
  const invalidateQueryValue = useAtomValue(invalidationQueryAtom);

  return async (ids: string[], action: 'archive' | 'restore' | 'delete') => {
    toast.processing();

    return request(
      'POST',
      docuNinjaEndpoint('/api/users/bulk'),
      {
        action,
        ids,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('X-DOCU-NINJA-TOKEN')}`,
        },
        skipIntercept: true,
      }
    ).then(() => {
      const message = `${action}d_user`;

      toast.success(message);

      invalidateQueryValue &&
        queryClient.invalidateQueries({
          queryKey: [invalidateQueryValue],
        });

      $refetch(['docuninja_users']);
    });
  };
}
