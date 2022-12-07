/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { enterprisePlan } from 'common/guards/guards/enterprise-plan';
import { proPlan } from 'common/guards/guards/pro-plan';
import { Breadcrumbs, Page } from 'components/Breadcrumbs';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { classNames } from '../../common/helpers';
import { SelectField } from '../forms';
import { Default } from './Default';

interface Props {
  title: string;
  children: ReactNode;
  onSaveClick?: any;
  onCancelClick?: any;
  breadcrumbs?: Page[];
  docsLink?: string;
  navigationTopRight?: ReactNode;
  disableSaveButton?: boolean;
}

interface AdvanceSetting {
  name: string;
  href: string;
  current: boolean;
  children?: AdvanceSetting[];
  visible: boolean;
}

export function Settings(props: Props) {
  const [t] = useTranslation();
  const location = useLocation();

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
      name: t('payment_settings'),
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
      name: t('account_management'),
      href: '/settings/account_management',
      current: location.pathname === '/settings/account_management',
    },
  ];

  const advanced: AdvanceSetting[] = [
    {
      name: t('invoice_design'),
      href: '/settings/invoice_design',
      current: location.pathname === '/settings/invoice_design',
      visible: proPlan() || enterprisePlan(),
    },
    {
      name: t('generated_numbers'),
      href: '/settings/generated_numbers',
      current: location.pathname === '/settings/generated_numbers',
      visible: proPlan() || enterprisePlan(),
    },
    {
      name: t('client_portal'),
      href: '/settings/client_portal',
      current: location.pathname === '/settings/client_portal',
      visible: proPlan() || enterprisePlan(),
    },
    {
      name: t('email_settings'),
      href: '/settings/email_settings',
      current: location.pathname === '/settings/email_settings',
      visible: proPlan() || enterprisePlan(),
    },
    {
      name: t('templates_and_reminders'),
      href: '/settings/templates_and_reminders',
      current: location.pathname === '/settings/templates_and_reminders',
      visible: proPlan() || enterprisePlan(),
    },
    {
      name: t('bank_accounts'),
      href: '/settings/bank_accounts',
      current: location.pathname === '/settings/bank_accounts',
      visible: enterprisePlan(),
    },
    {
      name: t('user_management'),
      href: '/settings/users',
      current: location.pathname.startsWith('/settings/users'),
      visible: enterprisePlan(),
    },
  ];

  return (
    <Default
      onSaveClick={props.onSaveClick}
      onCancelClick={props.onCancelClick}
      title={props.title}
      docsLink={props.docsLink}
      navigationTopRight={props.navigationTopRight}
      disableSaveButton={props.disableSaveButton}
    >
      <div className="grid grid-cols-12 lg:gap-10">
        <div className="col-span-12 md:col-span-4 lg:col-span-3">
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
            {advanced.map(
              (item) =>
                item.visible && (
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
                )
            )}
          </SelectField>

          <nav className="space-y-1 hidden lg:block" aria-label="Sidebar">
            {advanced.map(
              (item, index) =>
                item.visible && (
                  <div key={index}>
                    <Link
                      key={item.name}
                      to={item.href}
                      className={classNames(
                        item.current
                          ? 'bg-gray-200 text-gray-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                        item.children ? 'rounded-t' : 'rounded',
                        'flex items-center px-3 py-2 text-sm font-medium'
                      )}
                      aria-current={item.current ? 'page' : undefined}
                    >
                      <span className="truncate">{item.name}</span>
                    </Link>

                    {item.children && item.current && (
                      <div className="bg-gray-100 space-y-4 py-3 rounded-b">
                        {item.children &&
                          item.children.map((item, index) => (
                            <Link
                              key={index}
                              to={item.href}
                              className={classNames(
                                item.current
                                  ? 'text-gray-900 font-semibold'
                                  : '',
                                'ml-4 px-3 text-sm block text-gray-700 hover:text-gray-900 transition duration-200 ease-in-out'
                              )}
                            >
                              {item.name}
                            </Link>
                          ))}
                      </div>
                    )}
                  </div>
                )
            )}
          </nav>
        </div>

        <div className="col-span-12 md:col-span-8 lg:col-start-4 space-y-6 mt-5">
          {props.breadcrumbs && <Breadcrumbs pages={props.breadcrumbs} />}

          {props.children}
        </div>
      </div>
    </Default>
  );
}
