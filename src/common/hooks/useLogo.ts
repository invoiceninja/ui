/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import companySettings from '$app/common/constants/company-settings';
import { useCurrentCompany } from './useCurrentCompany';
import { useTranslation } from 'react-i18next';

export function useLogo() {
  const currentCompany = useCurrentCompany();

  return currentCompany?.settings?.company_logo || companySettings.logo;
}

export function useCompanyName() {
  const currentCompany = useCurrentCompany();
  const [t] = useTranslation();

  return currentCompany?.settings?.name || t('untitled_company');
}
