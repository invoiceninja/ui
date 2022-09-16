/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { InvoiceSum } from "common/helpers/invoices/invoice-sum";
import { RecurringInvoice } from "common/interfaces/recurring-invoice";
import { atom } from "jotai";

export const recurringInvoiceAtom = atom<RecurringInvoice | undefined>(
  undefined,
);

export const invoiceSumAtom = atom<InvoiceSum | undefined>(undefined);
