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
import { Credit } from '$app/common/interfaces/credit';
import { atom } from 'jotai';

export const creditAtom = atom<Credit | undefined>(undefined);
export const invoiceSumAtom = atom<InvoiceSum | undefined>(undefined);
