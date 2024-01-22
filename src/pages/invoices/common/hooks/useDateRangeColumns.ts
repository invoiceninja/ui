/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { DateRangeColumn } from '$app/components/DataTable';

export function useDateRangeColumns() {
  const columns: DateRangeColumn[] = [
    { column: 'date', queryParameterKey: 'date_range' },
    { column: 'due_date', queryParameterKey: 'due_date_range' },
  ];

  return columns;
}
