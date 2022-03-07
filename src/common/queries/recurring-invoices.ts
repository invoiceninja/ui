/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import axios from 'axios';
import { endpoint } from 'common/helpers';
import { useQuery } from 'react-query';
import { generatePath } from 'react-router-dom';
import { defaultHeaders } from './common/headers';

export function useBlankRecurringInvoiceQuery(
  options: Record<string, any> = {}
) {
  return useQuery(
    generatePath('/api/v1/recurring_invoices/create'),
    () =>
      axios.get(endpoint('/api/v1/recurring_invoices/create'), {
        headers: defaultHeaders,
      }),
    { ...options, staleTime: Infinity }
  );
}
