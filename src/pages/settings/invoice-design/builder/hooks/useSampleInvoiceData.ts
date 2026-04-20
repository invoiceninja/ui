/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useMemo } from 'react';
import { useLogo } from '$app/common/hooks/useLogo';
import {
  InvoiceData,
  SAMPLE_INVOICE_DATA,
} from '../utils/variable-replacer';

export function useSampleInvoiceData(): InvoiceData {
  const companyLogo = useLogo();

  return useMemo(
    () => ({
      ...SAMPLE_INVOICE_DATA,
      company: {
        ...SAMPLE_INVOICE_DATA.company,
        logo: companyLogo || SAMPLE_INVOICE_DATA.company.logo,
      },
    }),
    [companyLogo]
  );
}
