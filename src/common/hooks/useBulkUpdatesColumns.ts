/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect, useState } from 'react';
import { useStaticsQuery } from '../queries/statics';

export function useBulkUpdatesColumns() {
  const { data: statics } = useStaticsQuery();

  const [bulkUpdates, setBulkUpdates] = useState<Record<string, string[]>>();

  useEffect(() => {
    if (statics?.bulk_updates) {
      setBulkUpdates(statics.bulk_updates);
    }
  }, [statics]);

  return bulkUpdates;
}
