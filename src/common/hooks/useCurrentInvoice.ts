import { RootState } from 'common/stores/store';
import { useSelector } from 'react-redux';
/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export function useCurrentInvoice() {
  return useSelector((state: RootState) => state.invoices.current);
}
