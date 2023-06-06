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
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { useResolveLanguage } from '$app/common/hooks/useResolveLanguage';
import { AccountWarningsModal } from '$app/components/AccountWarningsModal';
import { VerifyModal } from '$app/components/VerifyModal';
import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { routes } from './common/routes';
import { RootState } from './common/stores/store';

export function App() {
  const { i18n } = useTranslation();

  const company = useCurrentCompany();

  const user = useCurrentUser();

  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(true);

  const [showCompanyActivityModal, setShowCompanyActivityModal] =
    useState<boolean>(false);

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
    if (user && Object.keys(user).length) {
      setIsEmailVerified(Boolean(user.email_verified_at));
    }
  }, [user]);

  useEffect(() => {
    const modalShown = sessionStorage.getItem('COMPANY-ACTIVITY-SHOWN');

    if (company && (modalShown === 'false' || !modalShown)) {
      setShowCompanyActivityModal(company.is_disabled);

      sessionStorage.setItem('COMPANY-ACTIVITY-SHOWN', 'true');
    }
  }, [company]);

  return (
    <div className="App">
      <VerifyModal visible={!isEmailVerified && isHosted()} type="email" />

      <AccountWarningsModal
        type="activity"
        visible={Boolean(company) && showCompanyActivityModal}
        setVisible={setShowCompanyActivityModal}
      />

      <Toaster position="top-center" />

      {routes}
    </div>
  );
}
