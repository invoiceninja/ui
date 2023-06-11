/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { FormEvent, ReactElement, ReactNode, useEffect, useState } from 'react';
import {
  Home,
  Menu as MenuIcon,
  Box,
  FileText,
  Settings,
  Users,
  PlusCircle,
  Repeat,
  CreditCard,
  File,
  Briefcase,
  Clock,
  PieChart,
} from 'react-feather';
import CommonProps from '../../common/interfaces/common-props.interface';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '$app/components/forms';
import { Breadcrumbs, Page } from '$app/components/Breadcrumbs';
import { useSelector } from 'react-redux';
import { RootState } from '$app/common/stores/store';
import { DesktopSidebar, NavigationItem } from './components/DesktopSidebar';
import { MobileSidebar } from './components/MobileSidebar';
import {
  useAdmin,
  useHasPermission,
} from '$app/common/hooks/permissions/useHasPermission';
import { BiBuildings, BiWallet, BiFile } from 'react-icons/bi';
import { AiOutlineBank } from 'react-icons/ai';
import { ModuleBitmask } from '$app/pages/settings/account-management/component';
import { QuickCreatePopover } from '$app/components/QuickCreatePopover';
import { isDemo, isHosted, isSelfHosted } from '$app/common/helpers';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { useUnlockButtonForHosted } from '$app/common/hooks/useUnlockButtonForHosted';
import { useUnlockButtonForSelfHosted } from '$app/common/hooks/useUnlockButtonForSelfHosted';
import { useCurrentCompanyUser } from '$app/common/hooks/useCurrentCompanyUser';
import { useEnabled } from '$app/common/guards/guards/enabled';
import { Dropdown } from '$app/components/dropdown/Dropdown';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { useSaveBtn } from '$app/components/layouts/common/hooks';
import { useCurrentAccount } from '$app/common/hooks/useCurrentAccount';
import { PhoneVerificationBanner } from '../PhoneVerificationBanner';

export interface SaveOption {
  label: string;
  onClick: (event: FormEvent<HTMLFormElement>) => unknown;
  icon?: ReactElement;
}

interface Props extends CommonProps {
  title?: string | null;
  onSaveClick?: any;
  onCancelClick?: any;
  breadcrumbs?: Page[];
  topRight?: ReactNode;
  docsLink?: string;
  navigationTopRight?: ReactNode;
  saveButtonLabel?: string | null;
  backButtonLabel?: string;
  disableSaveButton?: boolean;
  withoutBackButton?: boolean;
  additionalSaveOptions?: SaveOption[];
}

export function Default(props: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const account = useCurrentAccount();

  const shouldShowUnlockButton =
    !isDemo() && (useUnlockButtonForHosted() || useUnlockButtonForSelfHosted());

  const [showSmsVerificationBanner, setShowSmsVerificationBanner] =
    useState<boolean>(false);

  const isMiniSidebar = useSelector(
    (state: RootState) => state.settings.isMiniSidebar
  );

  const [t] = useTranslation();
  const user = useCurrentUser();

  const hasPermission = useHasPermission();
  const location = useLocation();
  const navigate = useNavigate();
  const companyUser = useCurrentCompanyUser();
  const enabled = useEnabled();

  const navigation: NavigationItem[] = [
    {
      name: t('dashboard'),
      href: '/dashboard',
      icon: Home,
      current: location.pathname.startsWith('/dashboard'),
      visible: true,
    },
    {
      name: t('clients'),
      href: '/clients',
      icon: Users,
      current: location.pathname.startsWith('/clients'),
      visible:
        hasPermission('view_client') ||
        hasPermission('create_client') ||
        hasPermission('edit_client'),
      rightButton: {
        icon: PlusCircle,
        to: '/clients/create',
        label: t('new_client'),
        visible: hasPermission('create_client'),
      },
    },
    {
      name: t('products'),
      href: '/products',
      icon: Box,
      current: location.pathname.startsWith('/products'),
      visible:
        hasPermission('view_product') ||
        hasPermission('create_product') ||
        hasPermission('edit_product'),
      rightButton: {
        icon: PlusCircle,
        to: '/products/create',
        label: t('new_product'),
        visible: hasPermission('create_product'),
      },
    },
    {
      name: t('invoices'),
      href: '/invoices',
      icon: FileText,
      current: location.pathname.startsWith('/invoices'),
      visible:
        enabled(ModuleBitmask.Invoices) &&
        (hasPermission('view_invoice') ||
          hasPermission('create_invoice') ||
          hasPermission('edit_invoice')),
      rightButton: {
        icon: PlusCircle,
        to: '/invoices/create',
        label: t('new_invoice'),
        visible: hasPermission('create_invoice'),
      },
    },
    {
      name: t('recurring_invoices'),
      href: '/recurring_invoices',
      icon: Repeat,
      current: location.pathname.startsWith('/recurring_invoices'),
      visible:
        enabled(ModuleBitmask.RecurringInvoices) &&
        (hasPermission('view_recurring_invoice') ||
          hasPermission('create_recurring_invoice') ||
          hasPermission('edit_recurring_invoice')),
      rightButton: {
        icon: PlusCircle,
        to: '/recurring_invoices/create',
        label: t('new_recurring_invoice'),
        visible: hasPermission('create_recurring_invoice'),
      },
    },
    {
      name: t('payments'),
      href: '/payments',
      icon: CreditCard,
      current: location.pathname.startsWith('/payments'),
      visible:
        hasPermission('view_payment') ||
        hasPermission('create_payment') ||
        hasPermission('edit_payment'),
      rightButton: {
        icon: PlusCircle,
        to: '/payments/create',
        label: t('new_payment'),
        visible: hasPermission('create_payment'),
      },
    },
    {
      name: t('quotes'),
      href: '/quotes',
      icon: File,
      current: location.pathname.startsWith('/quotes'),
      visible:
        enabled(ModuleBitmask.Quotes) &&
        (hasPermission('view_quote') ||
          hasPermission('create_quote') ||
          hasPermission('edit_quote')),
      rightButton: {
        icon: PlusCircle,
        to: '/quotes/create',
        label: t('new_quote'),
        visible: hasPermission('create_quote'),
      },
    },
    {
      name: t('credits'),
      href: '/credits',
      icon: FileText,
      current: location.pathname.startsWith('/credits'),
      visible:
        enabled(ModuleBitmask.Credits) &&
        (hasPermission('view_credit') ||
          hasPermission('create_credit') ||
          hasPermission('edit_credit')),
      rightButton: {
        icon: PlusCircle,
        to: '/credits/create',
        label: t('new_credit'),
        visible: hasPermission('create_credit'),
      },
    },
    {
      name: t('projects'),
      href: '/projects',
      icon: Briefcase,
      current: location.pathname.startsWith('/projects'),
      visible:
        enabled(ModuleBitmask.Projects) &&
        (hasPermission('view_project') ||
          hasPermission('create_project') ||
          hasPermission('edit_project')),
      rightButton: {
        icon: PlusCircle,
        to: '/projects/create',
        label: t('new_project'),
        visible: hasPermission('create_project'),
      },
    },
    {
      name: t('tasks'),
      href: '/tasks',
      icon: Clock,
      current: location.pathname.startsWith('/tasks'),
      visible:
        enabled(ModuleBitmask.Tasks) &&
        (hasPermission('view_task') ||
          hasPermission('edit_task') ||
          hasPermission('create_task')),
      rightButton: {
        icon: PlusCircle,
        to: '/tasks/create',
        label: t('new_task'),
        visible: hasPermission('create_task'),
      },
    },
    {
      name: t('vendors'),
      href: '/vendors',
      icon: BiBuildings,
      current: location.pathname.startsWith('/vendors'),
      visible:
        enabled(ModuleBitmask.Vendors) &&
        (hasPermission('view_vendor') ||
          hasPermission('create_vendor') ||
          hasPermission('edit_vendor')),
      rightButton: {
        icon: PlusCircle,
        to: '/vendors/create',
        label: t('new_vendor'),
        visible: hasPermission('create_vendor'),
      },
    },
    {
      name: t('purchase_orders'),
      href: '/purchase_orders',
      icon: BiFile,
      current: location.pathname.startsWith('/purchase_orders'),
      visible:
        enabled(ModuleBitmask.PurchaseOrders) &&
        (hasPermission('view_purchase_order') ||
          hasPermission('create_purchase_order') ||
          hasPermission('edit_purchase_order')),
      rightButton: {
        icon: PlusCircle,
        to: '/purchase_orders/create',
        label: t('new_purchase_order'),
        visible: hasPermission('create_purchase_order'),
      },
    },
    {
      name: t('expenses'),
      href: '/expenses',
      icon: BiWallet,
      current: location.pathname.startsWith('/expenses'),
      visible:
        enabled(ModuleBitmask.Expenses) &&
        (hasPermission('view_expense') ||
          hasPermission('create_expense') ||
          hasPermission('edit_expense')),
      rightButton: {
        icon: PlusCircle,
        to: '/expenses/create',
        label: t('new_expense'),
        visible: hasPermission('create_expense'),
      },
    },
    {
      name: t('recurring_expenses'),
      href: '/recurring_expenses',
      icon: Repeat,
      current: location.pathname.startsWith('/recurring_expenses'),
      visible:
        enabled(ModuleBitmask.RecurringExpenses) &&
        (hasPermission('view_recurring_expense') ||
          hasPermission('create_recurring_expense') ||
          hasPermission('edit_recurring_expense')),
      rightButton: {
        icon: PlusCircle,
        to: '/recurring_expenses/create',
        label: t('new_recurring_expense'),
        visible: hasPermission('create_recurring_expense'),
      },
    },
    {
      name: t('reports'),
      href: '/reports',
      icon: PieChart,
      current: location.pathname.startsWith('/reports'),
      visible: hasPermission('view_reports'),
    },
    {
      name: t('transactions'),
      href: '/transactions',
      icon: AiOutlineBank,
      current: location.pathname.startsWith('/transactions'),
      visible:
        enabled(ModuleBitmask.Transactions) &&
        (hasPermission('view_bank_transaction') ||
          hasPermission('create_bank_transaction') ||
          hasPermission('edit_bank_transaction')),
      rightButton: {
        icon: PlusCircle,
        to: '/transactions/create',
        label: t('new_transaction'),
        visible: hasPermission('create_bank_transaction'),
      },
    },
    {
      name: t('settings'),
      href:
        companyUser?.is_admin || companyUser?.is_owner
          ? '/settings/company_details'
          : '/settings/user_details',
      icon: Settings,
      current: location.pathname.startsWith('/settings'),
      visible: true,
    },
  ];

  const { isOwner } = useAdmin();
  const saveBtn = useSaveBtn();

  useEffect(() => {
    if (account) {
      setShowSmsVerificationBanner(!account.account_sms_verified && isHosted());
    }
  }, [account?.account_sms_verified]);

  return (
    <>
      {showSmsVerificationBanner && <PhoneVerificationBanner />}

      <div>
        <MobileSidebar
          navigation={navigation}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <DesktopSidebar
          navigation={navigation}
          docsLink={props.docsLink}
          isBannerDisplayed={showSmsVerificationBanner}
        />

        <div
          className={`${
            isMiniSidebar ? 'md:pl-16' : 'md:pl-64'
          } flex flex-col flex-1`}
        >
          <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white dark:bg-gray-800 shadow">
            <button
              type="button"
              className="px-4 border-r border-gray-200 dark:border-gray-700 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <MenuIcon className="dark:text-gray-100" />
            </button>
            <div className="flex-1 px-4 md:px-8 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-sm md:text-xl dark:text-gray-100">
                  {props.title}
                </h2>

                <QuickCreatePopover />
              </div>

              <div className="ml-4 flex items-center md:ml-6 space-x-2 lg:space-x-3">
                {shouldShowUnlockButton && (
                  <button
                    className="inline-flex items-center justify-center py-2 px-4 rounded text-sm text-white bg-green-500 hover:bg-green-600"
                    onClick={() =>
                      window.open(
                        isSelfHosted()
                          ? import.meta.env.VITE_WHITELABEL_INVOICE_URL ||
                              'https://app.invoiceninja.com/buy_now/?account_key=AsFmBAeLXF0IKf7tmi0eiyZfmWW9hxMT&product_id=3'
                          : user?.company_user?.ninja_portal_url,
                        '_blank'
                      )
                    }
                  >
                    <span>
                      {isSelfHosted() && isOwner
                        ? t('white_label_button')
                        : t('unlock_pro')}
                    </span>
                  </button>
                )}

                {props.onCancelClick && (
                  <Button onClick={props.onCancelClick} type="secondary">
                    {t('cancel')}
                  </Button>
                )}

                {!props.withoutBackButton && (
                  <Button onClick={() => navigate(-1)} type="secondary">
                    {t('back')}
                  </Button>
                )}

                {(props.onSaveClick || saveBtn) && (
                  <div>
                    {(props.onSaveClick || saveBtn?.onClick) &&
                      !props.additionalSaveOptions && (
                        <Button
                          onClick={saveBtn?.onClick || props.onSaveClick}
                          disabled={
                            saveBtn?.disableSaveButton ||
                            props.disableSaveButton
                          }
                          disableWithoutIcon
                        >
                          {(saveBtn?.label || props.saveButtonLabel) ??
                            t('save')}
                        </Button>
                      )}

                    {(props.onSaveClick || saveBtn?.onClick) &&
                      props.additionalSaveOptions && (
                        <div className="flex">
                          <Button
                            className="rounded-br-none rounded-tr-none px-3"
                            onClick={saveBtn?.onClick || props.onSaveClick}
                            disabled={
                              saveBtn?.disableSaveButton ||
                              props.disableSaveButton
                            }
                            disableWithoutIcon
                          >
                            {(saveBtn?.label || props.saveButtonLabel) ??
                              t('save')}
                          </Button>

                          <Dropdown
                            className="rounded-bl-none rounded-tl-none h-full px-1 border-gray-200 border-l-1 border-y-0 border-r-0"
                            cardActions
                            disabled={
                              saveBtn?.disableSaveButton ||
                              props.disableSaveButton
                            }
                          >
                            {props.additionalSaveOptions.map(
                              (option, index) => (
                                <DropdownElement
                                  key={index}
                                  icon={option.icon}
                                  disabled={props.disableSaveButton}
                                  onClick={option.onClick}
                                >
                                  {option.label}
                                </DropdownElement>
                              )
                            )}
                          </Dropdown>
                        </div>
                      )}
                  </div>
                )}

                <div className="space-x-3 items-center hidden lg:flex">
                  {props.navigationTopRight}
                </div>
              </div>
            </div>
          </div>

          <main className="flex-1">
            {(props.breadcrumbs || props.topRight) && (
              <div className="pt-4 px-4 md:px-8 md:pt-8 dark:text-gray-100 flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
                <div className="">
                  {props.breadcrumbs && (
                    <Breadcrumbs pages={props.breadcrumbs} />
                  )}
                </div>

                {props.topRight && <div>{props.topRight}</div>}
              </div>
            )}

            <div className="p-4 md:py-8 xl:p-8 dark:text-gray-100">
              {props.children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
