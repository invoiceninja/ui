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
import { toast } from '$app/common/helpers/toast/toast';
import { useAdmin } from '$app/common/hooks/permissions/useHasPermission';
import { $refetch } from '$app/common/hooks/useRefetch';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { GenericManyResponse } from '$app/common/interfaces/generic-many-response';
import { Tag, TagEntityType } from '$app/common/interfaces/tag';
import { GenericQueryOptions } from './invoices';
import { useQuery } from 'react-query';

export function tagEndpoint(
  entityType: TagEntityType,
  params: Record<string, string> = {}
) {
  const searchParams = new URLSearchParams({
    entity_type: entityType,
    ...params,
  });

  return endpoint(`/api/v1/tags?${searchParams.toString()}`);
}

export function useBlankTagQuery(
  entityType: TagEntityType,
  options?: GenericQueryOptions
) {
  const { isAdmin } = useAdmin();

  return useQuery<Tag>(
    ['/api/v1/tags', entityType, 'create'],
    () =>
      Promise.resolve({
        id: '',
        entity_type: entityType,
        name: '',
        color: null,
        is_deleted: false,
        archived_at: 0,
        created_at: 0,
        updated_at: 0,
      }),
    {
      ...options,
      staleTime: Infinity,
      enabled: isAdmin ? options?.enabled ?? true : false,
    }
  );
}

export function useTagsQuery(params: {
  entityType: TagEntityType;
  enabled?: boolean;
}) {
  return useQuery<GenericManyResponse<Tag>>(
    ['/api/v1/tags', params.entityType],
    () =>
      request(
        'GET',
        tagEndpoint(params.entityType, { sort: 'name|asc', per_page: '1000' })
      ).then((response) => response.data),
    { staleTime: Infinity, enabled: params.enabled ?? true }
  );
}

export function useTagQuery(params: { id: string | undefined }) {
  return useQuery<GenericSingleResourceResponse<Tag>>(
    ['/api/v1/tags', params.id],
    () => request('GET', endpoint('/api/v1/tags/:id', { id: params.id })),
    { staleTime: Infinity, enabled: Boolean(params.id) }
  );
}

export function useBulkAction() {
  return (id: string, action: 'archive' | 'restore' | 'delete') => {
    toast.processing();

    request('POST', endpoint('/api/v1/tags/bulk'), {
      action,
      ids: [id],
    }).then(() => {
      toast.success(`${action}d_tag`);

      $refetch(['tags']);
    });
  };
}
