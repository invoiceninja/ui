/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { InvoiceSum } from '$app/common/helpers/invoices/invoice-sum';
import { InvoiceSumInclusive } from '$app/common/helpers/invoices/invoice-sum-inclusive';
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';
import { atom } from 'jotai';

export const recurringInvoiceAtom = atom<RecurringInvoice | undefined>(
  undefined
);

export const invoiceSumAtom = atom<
  InvoiceSum | InvoiceSumInclusive | undefined
>(undefined);
