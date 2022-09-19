/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { atom } from "jotai";
import { Quote } from "common/interfaces/quote";
import { InvoiceSum } from "common/helpers/invoices/invoice-sum";

export const quoteAtom = atom<Quote | undefined>(undefined);
export const invoiceSumAtom = atom<InvoiceSum | undefined>(undefined);
