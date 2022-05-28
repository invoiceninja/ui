/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ReactNode, useState } from 'react';
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
} from 'react-feather';
import CommonProps from '../../common/interfaces/common-props.interface';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Button } from '@invoiceninja/forms';
import { Breadcrumbs, BreadcrumRecord } from 'components/Breadcrumbs';
import { useSelector } from 'react-redux';
import { RootState } from 'common/stores/store';
import { DesktopSidebar } from './components/DesktopSidebar';
import { MobileSidebar } from './components/MobileSidebar';

interface Props extends CommonProps {
  title?: string;
  onSaveClick?: any;
  onCancelClick?: any;
  onBackClick?: string;
  breadcrumbs?: BreadcrumRecord[];
  topRight?: ReactNode;
  docsLink?: string;
  navigationTopRight?: ReactNode;
  saveButtonLabel?: string;
  backButtonLabel?: string;
  disableSaveButton?: boolean;
}

export function Default(props: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isMiniSidebar = useSelector(
    (state: RootState) => state.settings.isMiniSidebar
  );

  const [t] = useTranslation();

  const location = useLocation();

  const navigation = [
    {
      name: t('dashboard'),
      href: '/dashboard',
      icon: Home,
      current: location.pathname.startsWith('/dashboard'),
    },
    {
      name: t('clients'),
      href: '/clients',
      icon: Users,
      current: location.pathname.startsWith('/clients'),
      rightButton: {
        icon: PlusCircle,
        to: '/clients/create',
        label: t('new_client'),
      },
    },
    {
      name: t('products'),
      href: '/products',
      icon: Box,
      current: location.pathname.startsWith('/products'),
      rightButton: {
        icon: PlusCircle,
        to: '/products/create',
        label: t('new_product'),
      },
    },
    {
      name: t('invoices'),
      href: '/invoices',
      icon: FileText,
      current: location.pathname.startsWith('/invoices'),
      rightButton: {
        icon: PlusCircle,
        to: '/invoices/create',
        label: t('new_invoice'),
      },
    },
    {
      name: t('recurring_invoices'),
      href: '/recurring_invoices',
      icon: Repeat,
      current: location.pathname.startsWith('/recurring_invoices'),
      rightButton: {
        icon: PlusCircle,
        to: '/recurring_invoices/create',
        label: t('new_recurring_invoice'),
      },
    },
    {
      name: t('payments'),
      href: '/payments',
      icon: CreditCard,
      current: location.pathname.startsWith('/payments'),
      rightButton: {
        icon: PlusCircle,
        to: '/payments/create',
        label: t('new_payment'),
      },
    },
    // {
    //   name: t('credits'),
    //   href: '/credits',
    //   icon: File,
    //   current: location.pathname === '/credits',
    //   rightButton: {
    //     icon: PlusCircle,
    //     to: '/credits/create',
    //     label: t('new_credit'),
    //   },
    // },
    // {
    //   name: t('projects'),
    //   href: '/projects',
    //   icon: Briefcase,
    //   current: location.pathname === '/projects',
    //   rightButton: {
    //     icon: PlusCircle,
    //     to: '/projects/create',
    //     label: t('new_project'),
    //   },
    // },
    // {
    //   name: t('vendors'),
    //   href: '/vendors',
    //   icon: Truck,
    //   current: location.pathname === '/vendors',
    //   rightButton: {
    //     icon: PlusCircle,
    //     to: '/vendors/create',
    //     label: t('new_vendor'),
    //   },
    // },
    // {
    //   name: t('expenses'),
    //   href: '/expenses',
    //   icon: DollarSign,
    //   current: location.pathname === '/expenses',
    //   rightButton: {
    //     icon: PlusCircle,
    //     to: '/expenses/create',
    //     label: t('new_expense'),
    //   },
    // },
    // {
    //   name: t('recurring_expenses'),
    //   href: '/recurring_expenses',
    //   icon: RefreshCcw,
    //   current: location.pathname === '/recurring_expenses',
    //   rightButton: {
    //     icon: PlusCircle,
    //     to: '/recurring_expenses/create',
    //     label: t('new_recurring_expense'),
    //   },
    // },
    {
      name: t('settings'),
      href: '/settings/company_details',
      icon: Settings,
      current: location.pathname.startsWith('/settings'),
    },
  ];

  return (
    <>
      <div>
        <MobileSidebar
          navigation={navigation}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <DesktopSidebar navigation={navigation} docsLink={props.docsLink} />

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
            <div className="flex-1 px-4 flex items-center justify-between">
              <h2 className="text-sm md:text-xl dark:text-gray-100">
                {props.title}
              </h2>
              <div className="ml-4 flex items-center md:ml-6 space-x-2 lg:space-x-3">
                {props.onCancelClick && (
                  <Button onClick={props.onCancelClick} type="secondary">
                    {t('cancel')}
                  </Button>
                )}

                {props.onBackClick && (
                  <Button to={props.onBackClick} type="secondary">
                    {props.backButtonLabel ?? t('back')}
                  </Button>
                )}

                {props.onSaveClick && (
                  <Button
                    disabled={props.disableSaveButton}
                    disableWithoutIcon
                    onClick={props.onSaveClick}
                  >
                    {props.saveButtonLabel ?? t('save')}
                  </Button>
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

                {props.topRight && <div className="">{props.topRight}</div>}
              </div>
            )}

            <div className="p-4 md:p-8 dark:text-gray-100">
              {props.children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
