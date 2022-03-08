/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { RecurringInvoice } from 'common/interfaces/recurring-invoice';
import { RootState } from 'common/stores/store';
import { useSelector } from 'react-redux';

export function useCurrentRecurringInvoice(): RecurringInvoice | undefined {
  return useSelector((state: RootState) => state.recurringInvoices.current);
}
