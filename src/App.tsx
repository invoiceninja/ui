/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useResolveLanguage } from '$app/common/hooks/useResolveLanguage';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { routes } from './common/routes';
import { RootState } from './common/stores/store';
import dayjs from 'dayjs';
import { useResolveDayJSLocale } from './common/hooks/useResolveDayJSLocale';
import { useResolveAntdLocale } from './common/hooks/useResolveAntdLocale';
import { useAtom, useSetAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { dayJSLocaleAtom } from './components/forms';
import { antdLocaleAtom } from './components/DropdownDateRangePicker';
import { CompanyEdit } from './pages/settings/company/edit/CompanyEdit';
import { useAdmin } from './common/hooks/permissions/useHasPermission';
import { companyEditModalOpenedAtom } from './components/CompanySwitcher';

export function App() {
  const [t] = useTranslation();
  const { i18n } = useTranslation();

  const { isOwner } = useAdmin();

  const company = useCurrentCompany();

  const navigate = useNavigate();

  const updateDayJSLocale = useSetAtom(dayJSLocaleAtom);
  const updateAntdLocale = useSetAtom(antdLocaleAtom);

  const resolveLanguage = useResolveLanguage();

  const resolveDayJSLocale = useResolveDayJSLocale();

  const resolveAntdLocale = useResolveAntdLocale();

  const darkMode = useSelector((state: RootState) => state.settings.darkMode);

  const [isCompanyEditModalOpened, setIsCompanyEditModalOpened] = useAtom(
    companyEditModalOpenedAtom
  );

  const resolvedLanguage = company
    ? resolveLanguage(company.settings.language_id)
    : undefined;

  useEffect(() => {
    document.body.classList.add('bg-gray-50', 'dark:bg-gray-900');

    darkMode
      ? document.querySelector('html')?.classList.add('dark')
      : document.querySelector('html')?.classList.remove('dark');

    if (resolvedLanguage?.locale) {
      resolveDayJSLocale(resolvedLanguage.locale).then((resolvedLocale) => {
        updateDayJSLocale(resolvedLocale);
        dayjs.locale(resolvedLocale);
      });

      resolveAntdLocale(resolvedLanguage.locale).then((antdResolvedLocale) => {
        updateAntdLocale(antdResolvedLocale);
      });

      if (!i18n.hasResourceBundle(resolvedLanguage.locale, 'translation')) {
        fetch(
          new URL(
            `/src/resources/lang/${resolvedLanguage.locale}/${resolvedLanguage.locale}.json`,
            import.meta.url
          ).href
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

  useEffect(() => {
    window.addEventListener('navigate.invalid.page', () =>
      navigate('/not_found')
    );
  }, []);

  useEffect(() => {
    const companyName = company?.settings?.name;

    if (
      company &&
      (companyName.includes(t('untitled')) || !companyName) &&
      !isCompanyEditModalOpened
    ) {
      setIsCompanyEditModalOpened(true);
    }
  }, [company]);

  return (
    <>
      <div className="App">
        <Toaster position="top-center" />

        {routes}
      </div>

      <CompanyEdit
        isModalOpen={isCompanyEditModalOpened && isOwner}
        setIsModalOpen={setIsCompanyEditModalOpened}
      />
    </>
  );
}
