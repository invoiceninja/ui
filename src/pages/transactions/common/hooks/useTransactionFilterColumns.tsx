/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { TAG_ENTITY_TYPES } from '$app/common/interfaces/tag';
import { useTagsQuery } from '$app/common/queries/tags';
import { isActiveTag } from '$app/components/tags/TagPills';

export function useTransactionFilterColumns(params?: { enabled?: boolean }) {
  const { data: tags } = useTagsQuery({
    entityType: TAG_ENTITY_TYPES.bankTransaction,
    enabled: params?.enabled ?? true,
  });

  return [
    {
      column_id: 'bank_transaction_tag_ids',
      query_identifier: 'tag_ids',
      options:
        tags?.data.filter(isActiveTag).map((tag) => ({
          label: tag.name,
          value: tag.id,
        })) || [],
    },
  ];
}
