/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { RecurringInvoice } from 'common/interfaces/recurring-invoice';
import { RootState } from 'common/stores/store';
import { useSelector } from 'react-redux';

export function useCurrentRecurringInvoice(): RecurringInvoice | undefined {
  return useSelector((state: RootState) => state.recurringInvoices.current);
}
