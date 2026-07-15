/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import type { FilterColumn } from '$app/components/DataTable';
import { Tag } from '$app/common/interfaces/tag';
import { isActiveTag } from '$app/components/tags/TagPills';

export function buildTagFilterColumns(
  tags: Tag[] | undefined,
  tagColumnId: string
): FilterColumn[] {
  return [
    {
      column_id: tagColumnId,
      query_identifier: 'tag_ids',
      options:
        tags?.filter(isActiveTag).map((tag) => ({
          label: tag.name,
          value: tag.id,
        })) || [],
    },
  ];
}

export function omitFilterColumnValue(
  values: Record<string, string[]>,
  tagColumnKey: string
): Record<string, string[]> {
  const { [tagColumnKey]: _omitted, ...rest } = values;

  return rest;
}
