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
import { atom, useAtomValue, useSetAtom } from 'jotai';
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
import { $refetch, useRefetch } from './common/hooks/useRefetch';
import { toast } from './common/helpers/toast/toast';
import { PreventNavigationModal } from './components/PreventNavigationModal';
import { useAddPreventNavigationEvents } from './common/hooks/useAddPreventNavigationEvents';
import { useSockets } from './common/hooks/useSockets';
import {
  usePrivateSocketEvents,
  useSocketEvent,
} from './common/queries/sockets';
import { useWebSessionTimeout } from './common/hooks/useWebSessionTimeout';
import { isPasswordRequiredAtom } from './common/atoms/password-confirmation';
import { useSystemFonts } from './common/hooks/useSystemFonts';

interface RefreshEntityData {
  entity: 'invoices' | 'recurring_invoices';
  entity_id?: string;
}

export const refreshEntityDataBannerAtom = atom<{
  refetchEntityId: string;
  refetchEntity: 'invoices' | 'recurring_invoices';
  visible: boolean;
}>({
  refetchEntityId: '',
  refetchEntity: 'recurring_invoices',
  visible: false,
});

export function App() {
  const [t] = useTranslation();
  const { isOwner } = useAdmin();
  const { i18n } = useTranslation();

  const darkMode = useSelector((state: RootState) => state.settings.darkMode);

  const navigate = useNavigate();

  const { id } = useParams();
  const user = useCurrentUser();
  const location = useLocation();
  const company = useCurrentCompany();

  useWebSessionTimeout();
  useAddPreventNavigationEvents();

  const refetch = useRefetch();
  const hasPermission = useHasPermission();
  const resolveLanguage = useResolveLanguage();
  const resolveAntdLocale = useResolveAntdLocale();
  const resolveDayJSLocale = useResolveDayJSLocale();
  const switchToCompanySettings = useSwitchToCompanySettings();

  const colorScheme = useAtomValue(colorSchemeAtom);
  const setIsPasswordRequired = useSetAtom(isPasswordRequiredAtom);
  const setRefreshEntityDataBanner = useSetAtom(refreshEntityDataBannerAtom);

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

    window.addEventListener('reset.password.required', () => {
      setIsPasswordRequired(false);
    });

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

  const sockets = useSockets();

  usePrivateSocketEvents();

  useEffect(() => {
    if (company && sockets) {
      sockets.connection.bind('disconnected', () => {
        console.log('Disconnected from Pusher');
      });

      sockets.connection.bind('error', () => {
        console.error('Error from Pusher');
      });

      sockets.connect();
    }

    return () => {
      if (sockets && company) {
        sockets.disconnect();
      }
    };
  }, [company?.company_key]);

  useSystemFonts();

  useSocketEvent({
    on: 'App\\Events\\Socket\\RefreshEntity',
    callback: ({ data }) => {
      const currentData = data as RefreshEntityData;

      if (currentData.entity_id !== id) {
        $refetch([currentData.entity]);
      } else {
        setRefreshEntityDataBanner({
          visible: true,
          refetchEntity: currentData.entity,
          refetchEntityId: currentData.entity_id || '',
        });
      }
    },
  });

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

      <PreventNavigationModal />
    </>
  );
}
