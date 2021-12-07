/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { classNames } from '../../common/helpers';
import { SelectField } from '../forms';
import { Default } from './Default';

export function Settings(props: { title: string; children: ReactNode }) {
  const [t] = useTranslation();

  const basic = [
    {
      name: t('company_details'),
      href: '/settings/company_details',
      current: location.pathname === '/settings/company_details',
    },
    {
      name: t('user_details'),
      href: '/settings/user_details',
      current: location.pathname === '/settings/user_details',
    },
    {
      name: t('localization'),
      href: '/settings/localization',
      current: location.pathname === '/settings/localization',
    },
    {
      name: t('online_payments'),
      href: '/settings/online_payments',
      current: location.pathname === '/settings/online_payments',
    },
    {
      name: t('tax_settings'),
      href: '/settings/tax_settings',
      current: location.pathname === '/settings/tax_settings',
    },
    {
      name: t('product_settings'),
      href: '/settings/product_settings',
      current: location.pathname === '/settings/product_settings',
    },
    {
      name: t('task_settings'),
      href: '/settings/task_settings',
      current: location.pathname === '/settings/task_settings',
    },
    {
      name: t('expense_settings'),
      href: '/settings/expense_settings',
      current: location.pathname === '/settings/expense_settings',
    },
    {
      name: t('workflow_settings'),
      href: '/settings/workflow_settings',
      current: location.pathname === '/settings/workflow_settings',
    },
    {
      name: t('import_export'),
      href: '/settings/import_export',
      current: location.pathname === '/settings/import_export',
    },
    {
      name: t('account_management'),
      href: '/settings/account_management',
      current: location.pathname === '/settings/account_management',
    },
  ];

  const advanced = [
    {
      name: t('invoice_design'),
      href: '/settings/invoice_design',
      current: location.pathname === '/settings/invoice_design',
    },
    {
      name: t('custom_fields'),
      href: '/settings/custom_fields',
      current: location.pathname.startsWith('/settings/custom_fields'),
      children: [
        {
          name: t('company'),
          href: '/settings/custom_fields/company',
          current: location.pathname === '/settings/custom_fields/company',
        },
        {
          name: t('clients'),
          href: '/settings/custom_fields/clients',
          current: location.pathname === '/settings/custom_fields/clients',
        },
        {
          name: t('products'),
          href: '/settings/custom_fields/products',
          current: location.pathname === '/settings/custom_fields/products',
        },
        {
          name: t('invoices'),
          href: '/settings/custom_fields/invoices',
          current: location.pathname === '/settings/custom_fields/invoices',
        },
        {
          name: t('payments'),
          href: '/settings/custom_fields/payments',
          current: location.pathname === '/settings/custom_fields/payments',
        },
        {
          name: t('projects'),
          href: '/settings/custom_fields/projects',
          current: location.pathname === '/settings/custom_fields/projects',
        },
        {
          name: t('tasks'),
          href: '/settings/custom_fields/tasks',
          current: location.pathname === '/settings/custom_fields/tasks',
        },
        {
          name: t('vendors'),
          href: '/settings/custom_fields/vendors',
          current: location.pathname === '/settings/custom_fields/vendors',
        },
        {
          name: t('expenses'),
          href: '/settings/custom_fields/expenses',
          current: location.pathname === '/settings/custom_fields/expenses',
        },
        {
          name: t('users'),
          href: '/settings/custom_fields/users',
          current: location.pathname === '/settings/custom_fields/users',
        },
      ],
    },
  ];

  return (
    <Default title={props.title}>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-4 lg:col-span-2">
          <a className="flex items-center py-4 px-3 text-xs uppercase font-medium text-gray-600">
            <span className="truncate">{t('basic_settings')}</span>
          </a>

          <SelectField className="lg:hidden">
            {basic.map((item) => (
              <option
                key={item.name}
                value={item.href}
                className={classNames(
                  item.current
                    ? 'bg-gray-200 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  'flex items-center px-3 py-2 text-sm font-medium rounded'
                )}
                aria-current={item.current ? 'page' : undefined}
              >
                {item.name}
              </option>
            ))}
          </SelectField>

          <nav className="space-y-1 hidden lg:block" aria-label="Sidebar">
            {basic.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={classNames(
                  item.current
                    ? 'bg-gray-200 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  'flex items-center px-3 py-2 text-sm font-medium rounded'
                )}
                aria-current={item.current ? 'page' : undefined}
              >
                <span className="truncate">{item.name}</span>
              </Link>
            ))}
          </nav>

          <a className="flex items-center py-4 px-3 text-xs uppercase font-medium text-gray-600 mt-8">
            <span className="truncate">{t('advanced_settings')}</span>
          </a>

          <SelectField className="lg:hidden">
            {advanced.map((item) => (
              <option
                key={item.name}
                value={item.href}
                className={classNames(
                  item.current
                    ? 'bg-gray-200 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  'flex items-center px-3 py-2 text-sm font-medium rounded'
                )}
                aria-current={item.current ? 'page' : undefined}
              >
                {item.name}
              </option>
            ))}
          </SelectField>

          <nav className="space-y-1 hidden lg:block" aria-label="Sidebar">
            {advanced.map((item, index) => (
              <div key={index}>
                <Link
                  key={item.name}
                  to={item.href}
                  className={classNames(
                    item.current
                      ? 'bg-gray-200 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    'flex items-center px-3 py-2 text-sm font-medium rounded'
                  )}
                  aria-current={item.current ? 'page' : undefined}
                >
                  <span className="truncate">{item.name}</span>
                </Link>

                {item.children && item.current && (
                  <div className="bg-gray-100 space-y-4 py-3 rounded-b">
                    {item.children.map((item, index) => (
                      <Link
                        key={index}
                        to={item.href}
                        className={classNames(
                          item.current ? 'text-gray-900 font-semibold' : '',
                          'px-3 text-sm block text-gray-700 hover:text-gray-900 transition duration-200 ease-in-out'
                        )}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        <div className="col-span-12 md:col-span-8 lg:col-start-4 space-y-6">
          {props.children}
        </div>
      </div>
    </Default>
  );
}
