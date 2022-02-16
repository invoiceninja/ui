/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../../../components/cards';
import { Settings } from '../../../../components/layouts/Settings';
import { Field } from '../components';

export function Expenses() {
  const [t] = useTranslation();
  const title = `${t('custom_fields')}: ${t('expenses')}`;
  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('custom_fields'), href: '/settings/custom_fields' },
    { name: t('expenses'), href: '/settings/custom_fields/expenses' },
  ];
  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t('custom_fields')}`;
  });

  return (
    <Settings
      title={t('custom_fields')}
      breadcrumbs={pages}
      docsLink="docs/advanced-settings/#custom_fields"
    >
      <Card title={title}>
        {['expense1', 'expense2', 'expense3', 'expense4'].map((field) => (
          <Field key={field} field={field} placeholder={t('expense_field')} />
        ))}
      </Card>
    </Settings>
  );
}
