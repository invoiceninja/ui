/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Fragment, ReactNode, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  Home,
  Menu as MenuIcon,
  X,
  Box,
  FileText,
  Settings,
  Users,
  PlusCircle,
  Repeat,
  CreditCard,
  File,
  Briefcase,
  Truck,
  DollarSign,
  RefreshCcw,
} from 'react-feather';
import CommonProps from '../../common/interfaces/common-props.interface';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@invoiceninja/forms';
import { CompanySwitcher } from 'components/CompanySwitcher';
import { Breadcrumbs, BreadcrumRecord } from 'components/Breadcrumbs';
import { HelpSidebarIcons } from 'components/HelpSidebarIcons';

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ');
}

interface Props extends CommonProps {
  title?: string;
  onSaveClick?: any;
  onCancelClick?: any;
  onBackClick?: string;
  breadcrumbs?: BreadcrumRecord[];
  topRight?: ReactNode;
  docsLink?: string;
  navigationTopRight?: ReactNode;
}

export function Default(props: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [t] = useTranslation();
  const location = useLocation();

  const navigation = [
    {
      name: t('dashboard'),
      href: '/dashboard',
      icon: Home,
      current: location.pathname === '/dashboard',
    },
    {
      name: t('clients'),
      href: '/clients',
      icon: Users,
      current: location.pathname === '/clients',
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
      current: location.pathname === '/products',
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
      current: location.pathname === '/invoices',
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
      current: location.pathname === '/recurring_invoices',
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
      current: location.pathname === '/payments',
      rightButton: {
        icon: PlusCircle,
        to: '/payments/create',
        label: t('new_payment'),
      },
    },
    {
      name: t('credits'),
      href: '/credits',
      icon: File,
      current: location.pathname === '/credits',
      rightButton: {
        icon: PlusCircle,
        to: '/credits/create',
        label: t('new_credit'),
      },
    },
    {
      name: t('projects'),
      href: '/projects',
      icon: Briefcase,
      current: location.pathname === '/projects',
      rightButton: {
        icon: PlusCircle,
        to: '/projects/create',
        label: t('new_project'),
      },
    },
    {
      name: t('vendors'),
      href: '/vendors',
      icon: Truck,
      current: location.pathname === '/vendors',
      rightButton: {
        icon: PlusCircle,
        to: '/vendors/create',
        label: t('new_vendor'),
      },
    },
    {
      name: t('expenses'),
      href: '/expenses',
      icon: DollarSign,
      current: location.pathname === '/expenses',
      rightButton: {
        icon: PlusCircle,
        to: '/expenses/create',
        label: t('new_expense'),
      },
    },
    {
      name: t('recurring_expenses'),
      href: '/recurring_expenses',
      icon: RefreshCcw,
      current: location.pathname === '/recurring_expenses',
      rightButton: {
        icon: PlusCircle,
        to: '/recurring_expenses/create',
        label: t('new_recurring_expense'),
      },
    },
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
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog
            as="div"
            className="fixed inset-0 flex z-40 md:hidden"
            onClose={setSidebarOpen}
          >
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-gray-600 bg-opacity-75" />
            </Transition.Child>
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <div className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-ninja-gray dark:bg-gray-900">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute top-0 right-0 -mr-12 pt-2">
                    <button
                      type="button"
                      className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <X className="text-white" />
                    </button>
                  </div>
                </Transition.Child>
                <div className="flex-shrink-0 flex items-center px-4">
                  <CompanySwitcher />
                </div>

                <div className="mt-5 flex-1 h-0 overflow-y-auto">
                  <nav className="space-y-1">
                    {navigation.map((item) => (
                      <div
                        key={item.name}
                        className={classNames(
                          'flex items-center justify-between',
                          item.current
                            ? 'border-l-4 border-transparent bg-ninja-gray-darker text-gray-100 dark:bg-gray-700 dark:text-gray-100'
                            : 'border-l-4 border-transparent text-gray-100 hover:bg-ninja-gray-darker dark:hover:bg-gray-700 dark:hover:text-gray-100',
                          'group flex items-center justify-between px-4 text-sm font-medium'
                        )}
                      >
                        <Link to={item.href} className="w-full">
                          <div className="flex justify-start items-center my-2">
                            <item.icon
                              className={classNames(
                                item.current
                                  ? 'dark:text-gray-100'
                                  : 'dark:group-hover:text-gray-100',
                                'text-gray-100 mr-3 flex-shrink-0 h-6 w-6'
                              )}
                              aria-hidden="true"
                            />
                            {item.name}
                          </div>
                        </Link>

                        {item.rightButton && (
                          <Link
                            to={item.rightButton.to}
                            title={item.rightButton.label}
                            className="hover:bg-gray-200 hover:bg-opacity-10 rounded-full p-1.5"
                          >
                            <item.rightButton.icon />
                          </Link>
                        )}
                      </div>
                    ))}
                  </nav>
                </div>
              </div>
            </Transition.Child>
            <div className="flex-shrink-0 w-14" aria-hidden="true">
              {/* Dummy element to force sidebar to shrink to fit close icon */}
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r">
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex flex-col flex-grow border-gray-200 pt-5 bg-ninja-gray dark:bg-gray-800 dark:border-transparent overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <CompanySwitcher />
            </div>

            <div className="mt-5 flex-grow flex flex-col">
              <nav className="flex-1 pb-4 space-y-1">
                {navigation.map((item) => (
                  <div
                    key={item.name}
                    className={classNames(
                      'flex items-center justify-between',
                      item.current
                        ? 'border-l-4 border-transparent bg-ninja-gray-darker text-gray-100 dark:bg-gray-700 dark:text-gray-100'
                        : 'border-l-4 border-transparent text-gray-100 hover:bg-ninja-gray-darker dark:hover:bg-gray-700 dark:hover:text-gray-100',
                      'group flex items-center justify-between px-4 text-sm font-medium'
                    )}
                  >
                    <Link to={item.href} className="w-full">
                      <div className="flex justify-start items-center my-2">
                        <item.icon
                          className={classNames(
                            item.current
                              ? 'dark:text-gray-100'
                              : 'dark:group-hover:text-gray-100',
                            'text-gray-100 mr-3 flex-shrink-0 h-6 w-6'
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </div>
                    </Link>

                    {item.rightButton && (
                      <Link
                        to={item.rightButton.to}
                        title={item.rightButton.label}
                        className="hover:bg-gray-200 hover:bg-opacity-10 rounded-full p-1.5"
                      >
                        <item.rightButton.icon />
                      </Link>
                    )}
                  </div>
                ))}
              </nav>

              <HelpSidebarIcons docsLink={props.docsLink} />
            </div>
          </div>
        </div>
        <div className="md:pl-64 flex flex-col flex-1">
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
                    {t('back')}
                  </Button>
                )}

                {props.onSaveClick && (
                  <Button onClick={props.onSaveClick}>{t('save')}</Button>
                )}

                {props.navigationTopRight}
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
