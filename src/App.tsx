/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { isHosted } from '$app/common/helpers';
import { useCurrentAccount } from '$app/common/hooks/useCurrentAccount';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { useResolveLanguage } from '$app/common/hooks/useResolveLanguage';
import { AccountWarningsModal } from '$app/components/AccountWarningsModal';
import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { routes } from './common/routes';
import { RootState } from './common/stores/store';
import dayjs from 'dayjs';
import { useResolveDayJSLocale } from './common/hooks/useResolveDayJSLocale';
import { atom, useSetAtom } from 'jotai';

export const dayJSLocaleAtom = atom<ILocale | null>(null);

export function App() {
  const { i18n } = useTranslation();

  const company = useCurrentCompany();

  const user = useCurrentUser();

  const account = useCurrentAccount();

  const updateDayJSLocale = useSetAtom(dayJSLocaleAtom);

  const [showCompanyActivityModal, setShowCompanyActivityModal] =
    useState<boolean>(false);

  const [showSmsVerificationModal, setShowSmsVerificationModal] =
    useState<boolean>(false);

  const resolveLanguage = useResolveLanguage();

  const resolveDayJSLocale = useResolveDayJSLocale();

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
      resolveDayJSLocale(resolvedLanguage.locale).then((resolvedLocale) => {
        updateDayJSLocale(resolvedLocale);
        dayjs.locale(resolvedLocale);
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
    const modalShown = sessionStorage.getItem('PHONE-VERIFICATION-SHOWN');

    if (account && (modalShown === 'false' || !modalShown)) {
      setShowSmsVerificationModal(!account?.account_sms_verified);

      sessionStorage.setItem('PHONE-VERIFICATION-SHOWN', 'true');
    }
  }, [account]);

  useEffect(() => {
    const modalShown = sessionStorage.getItem('COMPANY-ACTIVITY-SHOWN');

    if (company && (modalShown === 'false' || !modalShown)) {
      setShowCompanyActivityModal(company.is_disabled);

      sessionStorage.setItem('COMPANY-ACTIVITY-SHOWN', 'true');
    }
  }, [company]);

  return (
    <div className="App">
      <AccountWarningsModal
        type="activity"
        visible={Boolean(company) && showCompanyActivityModal}
        setVisible={setShowCompanyActivityModal}
      />

      <AccountWarningsModal
        type="phone"
        visible={Boolean(account) && showSmsVerificationModal && isHosted()}
        setVisible={setShowSmsVerificationModal}
      />

      <Toaster position="top-center" />

      {routes}
    </div>
  );
}
