/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrentCompany } from './useCurrentCompany';

export function useCompanyVerifactu() {
  const company = useCurrentCompany();

  return Boolean(company?.settings.e_invoice_type === 'VERIFACTU');
}
