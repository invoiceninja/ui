/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { FilterColumn, filterColumnsValuesAtom } from '$app/components/DataTable';
import { TagEntityType } from '$app/common/interfaces/tag';
import { useTagsQuery } from '$app/common/queries/tags';
import {
  buildTagFilterColumns,
  omitFilterColumnValue,
} from '$app/common/helpers/tag-filter-columns';
import { useAtom } from 'jotai';
import { useEffect } from 'react';

export function useEntityTagFilterColumns(
  entityType: TagEntityType,
  tagColumnId: string,
  params?: { enabled?: boolean }
): FilterColumn[] {
  const { data: tags } = useTagsQuery({
    entityType,
    enabled: params?.enabled ?? true,
  });

  return buildTagFilterColumns(tags?.data, tagColumnId);
}

export function useTagFilterCleanup(
  shouldShowTagFilter: boolean,
  tagColumnKey: string
) {
  const [filterColumnsValues, setFilterColumnsValues] = useAtom(
    filterColumnsValuesAtom
  );

  const tagFilterValue = filterColumnsValues[tagColumnKey];

  useEffect(() => {
    if (!shouldShowTagFilter && tagFilterValue?.length) {
      setFilterColumnsValues((current) =>
        omitFilterColumnValue(current, tagColumnKey)
      );
    }
  }, [shouldShowTagFilter, tagFilterValue, tagColumnKey, setFilterColumnsValues]);
}
