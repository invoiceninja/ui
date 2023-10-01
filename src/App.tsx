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
import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { routes } from './common/routes';
import { RootState } from './common/stores/store';
import dayjs from 'dayjs';
import { useResolveDayJSLocale } from './common/hooks/useResolveDayJSLocale';
import { useResolveAntdLocale } from './common/hooks/useResolveAntdLocale';
import { useAtom, useSetAtom } from 'jotai';
import { useSwitchToCompanySettings } from './common/hooks/useSwitchToCompanySettings';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCurrentSettingsLevel } from './common/hooks/useCurrentSettingsLevel';
import { dayJSLocaleAtom } from './components/forms';
import { antdLocaleAtom } from './components/DropdownDateRangePicker';
import { CompanyEdit } from './pages/settings/company/edit/CompanyEdit';
import { useAdmin } from './common/hooks/permissions/useHasPermission';
import { colorSchemeAtom } from './common/colors';
import { useCurrentUser } from './common/hooks/useCurrentUser';

export function App() {
  const [t] = useTranslation();
  const { i18n } = useTranslation();

  const { isOwner } = useAdmin();

  const company = useCurrentCompany();

  const user = useCurrentUser();

  const navigate = useNavigate();

  const location = useLocation();

  const switchToCompanySettings = useSwitchToCompanySettings();

  const updateDayJSLocale = useSetAtom(dayJSLocaleAtom);

  const { isCompanySettingsActive, isGroupSettingsActive } =
    useCurrentSettingsLevel();

  const updateAntdLocale = useSetAtom(antdLocaleAtom);

  const resolveLanguage = useResolveLanguage();

  const resolveDayJSLocale = useResolveDayJSLocale();

  const resolveAntdLocale = useResolveAntdLocale();

  const darkMode = useSelector((state: RootState) => state.settings.darkMode);

  const [isCompanyEditModalOpened, setIsCompanyEditModalOpened] =
    useState(false);

  const resolvedLanguage = (user?.language_id && user.language_id.length > 1) ? resolveLanguage(user.language_id) : resolveLanguage(company?.settings?.language_id ?? "1");

  const [colorScheme] = useAtom(colorSchemeAtom);

  useEffect(() => {
    document.body.style.backgroundColor = colorScheme.$2;
  }, [colorScheme]);

  useEffect(() => {
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
      (!companyName || companyName === t('untitled_company')) &&
      localStorage.getItem('COMPANY-EDIT-OPENED') !== 'true'
    ) {
      localStorage.setItem('COMPANY-EDIT-OPENED', 'true');
      setIsCompanyEditModalOpened(true);
    }
  }, [company]);

  useEffect(() => {
    if (
      !location.pathname.startsWith('/settings') &&
      !isCompanySettingsActive
    ) {
      switchToCompanySettings();
    }

    if (
      location.pathname.startsWith('/settings/group_settings') &&
      isGroupSettingsActive
    ) {
      navigate('/settings/company_details');
    }
  }, [location]);

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
