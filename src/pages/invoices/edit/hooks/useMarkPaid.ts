/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { InvoiceStatus } from 'common/enums/invoice-status';
import { Invoice } from 'common/interfaces/invoice';
import { useInvoiceSave } from './useInvoiceSave';

export function useMarkPaid() {
  const handleSave = useInvoiceSave();

  return (invoice: Invoice) => {
    const copy = { ...invoice };
    copy.status_id = InvoiceStatus.Paid;

    handleSave(copy.id, copy);
  };
}
