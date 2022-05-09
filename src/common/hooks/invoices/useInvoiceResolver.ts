/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { InvoiceResolver } from 'common/helpers/invoices/invoice-resolver';

const invoiceResolver = new InvoiceResolver();

export function useInvoiceResolver() {
  return invoiceResolver;
}
