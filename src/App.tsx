/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useResolveLanguage } from 'common/hooks/useResolveLanguage';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { routes } from './common/routes';
import { RootState } from './common/stores/store';

export function App() {
  const { i18n } = useTranslation();

  const company = useCurrentCompany();

  const resolveLanguage = useResolveLanguage();

  const darkMode = useSelector((state: RootState) => state.settings.darkMode);

  const resolvedLanguage = company
    ? resolveLanguage(company.settings.language_id)
    : undefined;

  useEffect(() => {
    document.body.classList.add('bg-gray-50', 'dark:bg-gray-900');

    darkMode
      ? document.querySelector('html')?.classList.add('dark')
      : document.querySelector('html')?.classList.remove('dark');

    if (resolvedLanguage?.locale) {
      if (!i18n.hasResourceBundle(resolvedLanguage.locale, 'translation')) {
        fetch(
          `/src/resources/lang/${resolvedLanguage.locale}/${resolvedLanguage.locale}.json`
        )
          .then((response) => response.json())
          .then((response: JSON) => {
            i18n.addResources(resolvedLanguage.locale, 'translation', response);
            i18n.changeLanguage(resolvedLanguage.locale);
          });
      } else {
        i18n.changeLanguage(resolvedLanguage.locale);
      }
    }
  }, [darkMode, resolvedLanguage]);

  return (
    <div className="App">
      <Toaster position="top-center" />
      {routes}
    </div>
  );
}
