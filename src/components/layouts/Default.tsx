/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { FormEvent, ReactElement, ReactNode, useState } from 'react';
import { Menu as MenuIcon, Info } from 'react-feather';
import CommonProps from '../../common/interfaces/common-props.interface';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button, Link } from '$app/components/forms';
import { Breadcrumbs, Page } from '$app/components/Breadcrumbs';
import { DesktopSidebar } from './components/DesktopSidebar';
import { MobileSidebar } from './components/MobileSidebar';
import { QuickCreatePopover } from '$app/components/QuickCreatePopover';
import { isDemo, isHosted, isSelfHosted, trans } from '$app/common/helpers';
import { useUnlockButtonForHosted } from '$app/common/hooks/useUnlockButtonForHosted';
import { useUnlockButtonForSelfHosted } from '$app/common/hooks/useUnlockButtonForSelfHosted';
import { useCurrentCompanyUser } from '$app/common/hooks/useCurrentCompanyUser';
import { Dropdown } from '$app/components/dropdown/Dropdown';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import {
  saveBtnAtom,
  useNavigationTopRightElement,
} from '$app/components/layouts/common/hooks';
import { VerifyEmail } from '../banners/VerifyEmail';
import { ActivateCompany } from '../banners/ActivateCompany';
import { VerifyPhone } from '../banners/VerifyPhone';
import { useColorScheme } from '$app/common/colors';
import { Search } from '$app/pages/dashboard/components/Search';
import { useInjectUserChanges } from '$app/common/hooks/useInjectUserChanges';
import { useAtomValue } from 'jotai';
import { usePreventNavigation } from '$app/common/hooks/usePreventNavigation';
import { Notifications } from '../Notifications';
import { useSocketEvent } from '$app/common/queries/sockets';
import { Invoice } from '$app/common/interfaces/invoice';
import toast from 'react-hot-toast';
import { EInvoiceCredits } from '../banners/EInvoiceCredits';
import classNames from 'classnames';
import { useNavigation } from './common/navigation';

export interface SaveOption {
  label: string;
  onClick: (event: FormEvent<HTMLFormElement>) => unknown;
  icon?: ReactElement;
}

interface Props extends CommonProps {
  title?: string | null;
  onSaveClick?: any;
  onCancelClick?: any;
  breadcrumbs: Page[];
  topRight?: ReactNode;
  docsLink?: string;
  navigationTopRight?: ReactNode;
  saveButtonLabel?: string | null;
  disableSaveButton?: boolean;
  additionalSaveOptions?: SaveOption[];
  aboveMainContainer?: ReactNode;
  afterBreadcrumbs?: ReactNode;
}

export function Default(props: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();

  const preventNavigation = usePreventNavigation();

  const user = useInjectUserChanges();
  const companyUser = useCurrentCompanyUser();

  const isMiniSidebar = Boolean(
    user?.company_user?.react_settings.show_mini_sidebar
  );
  const shouldShowUnlockButton =
    !isDemo() && (useUnlockButtonForHosted() || useUnlockButtonForSelfHosted());

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const navigation = useNavigation();

  const saveBtn = useAtomValue(saveBtnAtom);
  const navigationTopRightElement = useNavigationTopRightElement();

  useSocketEvent<Invoice>({
    on: ['App\\Events\\Invoice\\InvoiceWasViewed'],
    callback: ({ data }) => {
      if (
        !companyUser?.notifications.email.includes('invoice_viewed') ||
        !companyUser?.notifications.email.includes('invoice_viewed_user')
      ) {
        return;
      }

      toast(
        <div className="flex flex-col gap-2">
          <span className="flex items-center gap-1">
            <Info size={18} />
            <span>
              {trans('notification_invoice_viewed_subject', {
                invoice: data.number,
                client: data.client?.display_name,
              })}
              .
            </span>
          </span>

          <div className="flex justify-center">
            <Link to={`/invoices/${data.id}/edit`}>{t('view_invoice')}</Link>
          </div>
        </div>,
        {
          duration: 8000,
          position: 'top-center',
        }
      );
    },
  });

  const navigate = useNavigate();

  return (
    <div>
      <div className="fixed bottom-4 right-4 z-50 flex items-end flex-col-reverse space-y-4 space-y-reverse">
        <ActivateCompany />
        <VerifyEmail />
        <VerifyPhone />
        <EInvoiceCredits />
      </div>

      <MobileSidebar
        navigation={navigation}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <DesktopSidebar navigation={navigation} docsLink={props.docsLink} />

      <div
        className={classNames('flex flex-col flex-1', {
          'md:pl-16': isMiniSidebar,
          'md:pl-64': !isMiniSidebar,
        })}
      >
        <div
          style={{ backgroundColor: colors.$1 }}
          className="sticky top-0 z-10 flex-shrink-0 flex h-16 border-b shadow"
        >
          <button
            type="button"
            className="px-4 border-r border-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <MenuIcon color={colors.$3} />
          </button>

          <div
            className="flex-1 px-4 xl:px-8 flex items-center"
            data-cy="topNavbar"
          >
            <div className="flex flex-1 items-center space-x-4">
              <h2
                style={{ color: colors.$3 }}
                className="text-sm md:text-lg whitespace-nowrap"
              >
                {props.title}
              </h2>

              <QuickCreatePopover />
              <Search />
            </div>

            <div className="ml-4 flex items-center md:ml-6 space-x-2 lg:space-x-3">
              <Notifications />

              {shouldShowUnlockButton && (
                <button
                  type="button"
                  className="hidden sm:inline-flex items-center justify-center px-4 rounded-md text-sm font-medium text-white relative overflow-hidden"
                  style={{
                    height: '2.25rem',
                    background: '#2176FF',
                    border: '1px solid #0062ff',
                    boxShadow:
                      '0px 1px 1px 0px #1453B82E, 0px 2px 2px 0px #1453B829, 0px 5px 3px 0px #1453B817, 0px 9px 4px 0px #1453B808, 0px 15px 4px 0px #1453B800, 0px 1px 0px 0px #FFFFFF40 inset, 0px 0px 0px 1px #0062FF',
                  }}
                  onClick={() => {
                    if (
                      isHosted() &&
                      import.meta.env.VITE_ENABLE_NEW_ACCOUNT_MANAGEMENT
                    ) {
                      return navigate('/settings/account_management');
                    }

                    preventNavigation({
                      url: (isSelfHosted()
                        ? import.meta.env.VITE_WHITELABEL_INVOICE_URL ||
                          'https://invoiceninja.invoicing.co/client/subscriptions/O5xe7Rwd7r/purchase'
                        : user?.company_user?.ninja_portal_url) as string,
                      externalLink: true,
                    });
                  }}
                >
                  <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

                  <span className="relative z-10 hidden xl:block">
                    {isSelfHosted() ? t('white_label_button') : t('unlock_pro')}
                  </span>

                  <span className="relative z-10 xl:hidden">
                    {t('upgrade')}
                  </span>
                </button>
              )}

              {props.onCancelClick && (
                <Button onClick={props.onCancelClick} type="secondary">
                  {t('cancel')}
                </Button>
              )}

              {(Boolean(props.onSaveClick) || saveBtn) && (
                <div>
                  {!props.additionalSaveOptions && (
                    <Button
                      onClick={saveBtn?.onClick || props.onSaveClick}
                      disabled={
                        saveBtn?.disableSaveButton || props.disableSaveButton
                      }
                      disableWithoutIcon
                    >
                      {(saveBtn?.label || props.saveButtonLabel) ?? t('save')}
                    </Button>
                  )}

                  {props.additionalSaveOptions && (
                    <div className="flex">
                      <Button
                        className="rounded-br-none rounded-tr-none px-3"
                        onClick={saveBtn?.onClick || props.onSaveClick}
                        disabled={
                          saveBtn?.disableSaveButton || props.disableSaveButton
                        }
                        disableWithoutIcon
                      >
                        {(saveBtn?.label || props.saveButtonLabel) ?? t('save')}
                      </Button>

                      <Dropdown
                        className="rounded-bl-none rounded-tl-none h-full px-1 border-l-1 border-y-0 border-r-0"
                        cardActions
                        disabled={
                          saveBtn?.disableSaveButton || props.disableSaveButton
                        }
                        labelButtonBorderColor={colors.$1}
                      >
                        {props.additionalSaveOptions.map((option, index) => (
                          <DropdownElement
                            key={index}
                            icon={option.icon}
                            disabled={props.disableSaveButton}
                            onClick={option.onClick}
                          >
                            {option.label}
                          </DropdownElement>
                        ))}
                      </Dropdown>
                    </div>
                  )}
                </div>
              )}

              {(navigationTopRightElement || props.navigationTopRight) && (
                <div className="flex space-x-3 items-center">
                  {navigationTopRightElement?.element ||
                    props.navigationTopRight}
                </div>
              )}
            </div>
          </div>
        </div>

        {props.aboveMainContainer}

        <main className="flex-1">
          {(props.breadcrumbs || props.topRight || props.afterBreadcrumbs) &&
            props.breadcrumbs.length > 0 && (
              <div className="pt-4 px-4 md:px-6 md:pt-6 dark:text-gray-100 flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
                <div className="flex items-center w-full">
                  {props.breadcrumbs && (
                    <Breadcrumbs pages={props.breadcrumbs} />
                  )}

                  {props.afterBreadcrumbs}
                </div>

                {props.topRight && <div>{props.topRight}</div>}
              </div>
            )}

          <div
            style={{ color: colors.$3, backgroundColor: colors.$23 }}
            className="p-4 xl:px-6 dark:text-gray-100"
          >
            {props.children}
          </div>
        </main>
      </div>
    </div>
  );
}
