/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrentCompany } from './useCurrentCompany';

export function useCompanyTranslations() {
  const company = useCurrentCompany();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (!company?.settings?.translations) {
      return;
    }

    const translations = company.settings.translations;
    const currentLang = i18n.language || 'en';

    i18n.addResources(currentLang, 'translation', translations);
  }, [company?.settings?.translations, i18n.language]);
}
