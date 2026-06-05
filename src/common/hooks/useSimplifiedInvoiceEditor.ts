/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import dayjs from 'dayjs';
import { SIMPLIFIED_INVOICE_EDITOR_CUTOFF } from '../constants/feature-cutoffs';
import { useCurrentCompanyUser } from './useCurrentCompanyUser';

export function useSimplifiedInvoiceEditor(): boolean {
  const companyUser = useCurrentCompanyUser();

  if (companyUser?.created_at) {
    return true;
  }

  const createdAt = dayjs.unix(companyUser?.created_at ?? 0).startOf('day');
  const cutoff = dayjs(SIMPLIFIED_INVOICE_EDITOR_CUTOFF).startOf('day');

  return !createdAt.isBefore(cutoff);
}
