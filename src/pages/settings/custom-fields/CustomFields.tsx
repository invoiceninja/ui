/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, ClickableElement } from '../../../components/cards';
import { Settings } from '../../../components/layouts/Settings';

export function CustomFields() {
  const [t] = useTranslation();

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t('custom_fields')}`;
  });
  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('custom_fields'), href: '/settings/custom_fields' },
  ];
  const modules = [
    { label: t('company'), link: '/settings/custom_fields/company' },
    { label: t('clients'), link: '/settings/custom_fields/clients' },
    { label: t('products'), link: '/settings/custom_fields/products' },
    { label: t('invoices'), link: '/settings/custom_fields/invoices' },
    { label: t('payments'), link: '/settings/custom_fields/payments' },
    { label: t('projects'), link: '/settings/custom_fields/projects' },
    { label: t('tasks'), link: '/settings/custom_fields/tasks' },
    { label: t('vendors'), link: '/settings/custom_fields/vendors' },
    { label: t('expenses'), link: '/settings/custom_fields/expenses' },
    { label: t('users'), link: '/settings/custom_fields/users' },
  ];

  return (
    <Settings
      title={t('custom_fields')}
      breadcrumbs={pages}
      docsLink="docs/advanced-settings/#custom_fields"
    >
      <Card title={t('custom_fields')}>
        {modules.map((module, index) => (
          <ClickableElement key={index} to={module.link}>
            {module.label}
          </ClickableElement>
        ))}
      </Card>
    </Settings>
  );
}
