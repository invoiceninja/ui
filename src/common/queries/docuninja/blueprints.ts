/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useQuery, useQueryClient } from 'react-query';
import { Params } from '../common/params.interface';
import { request } from '$app/common/helpers/request';
import { docuNinjaEndpoint } from '$app/common/helpers';
import { toast } from '$app/common/helpers/toast/toast';
import { useAtomValue } from 'jotai';
import { invalidationQueryAtom } from '$app/common/atoms/data-table';
import { $refetch } from '$app/common/hooks/useRefetch';

export function useBlueprintsQuery(params: Params) {
  return useQuery(
    ['/api/blueprints', params],
    () =>
      request(
        'GET',
        docuNinjaEndpoint(
          '/api/blueprints?per_page=:per_page&page=:page&filter=:filter',
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

interface BlueprintParams {
  id: string | undefined;
}

export function useBlueprintQuery(params: BlueprintParams) {
  return useQuery(
    ['/api/blueprints', params],
    () =>
      request(
        'GET',
        docuNinjaEndpoint('/api/blueprints/:id', {
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
      ),
    { staleTime: Infinity, enabled: Boolean(params.id) }
  );
}

export function useBulk() {
  const queryClient = useQueryClient();
  const invalidateQueryValue = useAtomValue(invalidationQueryAtom);

  return async (ids: string[], action: 'archive' | 'restore' | 'delete') => {
    toast.processing();

    return request(
      action === 'delete' ? 'DELETE' : 'POST',
      docuNinjaEndpoint(
        action === 'delete' ? '/api/blueprints/:id' : '/api/blueprints/bulk',
        {
          id: ids[0],
        }
      ),
      {
        ...(action !== 'delete' && { action }),
        ...(action !== 'delete' && { ids }),
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('X-DOCU-NINJA-TOKEN')}`,
        },
      }
    ).then(() => {
      const message = `${action}d_blueprint`;

      toast.success(message);

      invalidateQueryValue &&
        queryClient.invalidateQueries([invalidateQueryValue]);

      $refetch(['blueprints']);
    });
  };
}
