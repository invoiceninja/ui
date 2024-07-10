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
import { useAtomValue, useSetAtom } from 'jotai';
import { useSwitchToCompanySettings } from './common/hooks/useSwitchToCompanySettings';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useCurrentSettingsLevel } from './common/hooks/useCurrentSettingsLevel';
import { dayJSLocaleAtom } from './components/forms';
import { antdLocaleAtom } from './components/DropdownDateRangePicker';
import { CompanyEdit } from './pages/settings/company/edit/CompanyEdit';
import {
  useAdmin,
  useHasPermission,
} from './common/hooks/permissions/useHasPermission';
import { colorSchemeAtom } from './common/colors';
import { useCurrentUser } from './common/hooks/useCurrentUser';
import { useRefetch } from './common/hooks/useRefetch';
import { toast } from './common/helpers/toast/toast';
import { PreventNavigationModal } from './components/PreventNavigationModal';
import { useAddPreventNavigationEvents } from './common/hooks/useAddPreventNavigationEvents';
import Helmet from 'react-helmet';
import { isHosted } from './common/helpers';

export function App() {
  const [t] = useTranslation();
  const { isOwner } = useAdmin();
  const location = useLocation();
  const { i18n } = useTranslation();

  const facebookPixelId = import.meta.env.VITE_FACEBOOK_PIXEL_ID;
  const shouldIncludeScripts =
    isHosted() &&
    location.pathname !== '/' &&
    location.pathname !== '/login' &&
    location.pathname !== '/logout' &&
    location.pathname !== '/register';

  const darkMode = useSelector((state: RootState) => state.settings.darkMode);

  const navigate = useNavigate();

  const { id } = useParams();
  const user = useCurrentUser();
  const company = useCurrentCompany();
  useAddPreventNavigationEvents();

  const refetch = useRefetch();
  const hasPermission = useHasPermission();
  const resolveLanguage = useResolveLanguage();
  const resolveAntdLocale = useResolveAntdLocale();
  const resolveDayJSLocale = useResolveDayJSLocale();
  const switchToCompanySettings = useSwitchToCompanySettings();

  const colorScheme = useAtomValue(colorSchemeAtom);

  const updateAntdLocale = useSetAtom(antdLocaleAtom);
  const updateDayJSLocale = useSetAtom(dayJSLocaleAtom);

  const { isCompanySettingsActive, isGroupSettingsActive } =
    useCurrentSettingsLevel();

  const [isCompanyEditModalOpened, setIsCompanyEditModalOpened] =
    useState(false);

  const resolvedLanguage = company
    ? resolveLanguage(
        user?.language_id && user.language_id.length > 0
          ? user.language_id
          : company.settings.language_id
      )
    : undefined;

  const handleToasterErrors = (event: Event) => {
    if (!id && !location.pathname.startsWith('/settings')) {
      const { error } = (event as CustomEvent).detail;

      if (error.response.data.errors) {
        const errors = error.response.data.errors || {};
        const key = Object.keys(errors)?.[0];

        const errorMessage = errors?.[key]?.[0];

        if (errorMessage) {
          toast.error(errorMessage);
        }
      }
    }
  };

  useEffect(() => {
    document.body.style.backgroundColor = colorScheme.$2;
    document.body.style.colorScheme = colorScheme.$0;
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

    window.addEventListener('refetch', (event) => {
      const { property } = (event as CustomEvent).detail;

      refetch(property);
    });
  }, []);

  useEffect(() => {
    window.removeEventListener('display.error.toaster', handleToasterErrors);
    window.addEventListener('display.error.toaster', handleToasterErrors);

    return () => {
      window.removeEventListener('display.error.toaster', handleToasterErrors);
    };
  }, [id, location]);

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

  useEffect(() => {
    if (
      user &&
      Object.keys(user).length &&
      location.pathname.endsWith('/dashboard') &&
      !hasPermission('view_dashboard')
    ) {
      navigate('/settings/user_details');
    }
  }, [location, user]);

  return (
    <>
      {shouldIncludeScripts && (
        <Helmet>
          <script>
            {`
              const noscriptElement = document.createElement('noscript');
              noscriptElement.id = 'facebook-pixel-noscript';
              const pixelBody = document.createElement('img');
              pixelBody.height = '1';
              pixelBody.width = '1';
              pixelBody.style.display = 'none';
              pixelBody.src = \`https://www.facebook.com/tr?id='${facebookPixelId}'&ev=PageView&noscript=1\`;
              noscriptElement.appendChild(pixelBody);

              if (document.body) {
                document.body.appendChild(noscriptElement);
              } else {
                document.addEventListener('DOMContentLoaded', function () {
                  document.body.appendChild(noscriptElement);
                });
              }
            `}
          </script>
          <script>
            {`
              !(function (f, b, e, v, n, t, s) {
                if (f.fbq) return;
                n = f.fbq = function () {
                  n.callMethod
                    ? n.callMethod.apply(n, arguments)
                    : n.queue.push(arguments);
                };
                if (!f._fbq) f._fbq = n;
                n.push = n;
                n.loaded = !0;
                n.version = '2.0';
                n.queue = [];
                t = b.createElement(e);
                t.async = !0;
                t.src = v;
                s = b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t, s);
              })(
                window,
                document,
                'script',
                'https://connect.facebook.net/en_US/fbevents.js'
              );

              fbq('init', '${facebookPixelId}');
              fbq('track', 'PageView');
            `}
          </script>
        </Helmet>
      )}

      <div className="App">
        <Toaster position="top-center" />
        {routes}
      </div>

      <CompanyEdit
        isModalOpen={isCompanyEditModalOpened && isOwner}
        setIsModalOpen={setIsCompanyEditModalOpened}
      />

      <PreventNavigationModal />
    </>
  );
}
