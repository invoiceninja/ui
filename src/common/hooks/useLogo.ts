/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import companySettings from 'common/constants/company-settings';
import { useCurrentCompany } from './useCurrentCompany';

export function useLogo() {
  const currentCompany = useCurrentCompany();

  return currentCompany?.settings?.company_logo || companySettings.logo;
}
