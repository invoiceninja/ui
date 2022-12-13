/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card } from '@invoiceninja/cards';
import { useTitle } from 'common/hooks/useTitle';
import { Settings } from 'components/layouts/Settings';
import { useTranslation } from 'react-i18next';
import { CreateExpenseCategoryForm } from './components/CreateExpenseCategoryForm';

export function Create() {
  useTitle('new_expense_category');

  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('expense_settings'), href: '/settings/expense_settings' },
    {
      name: t('new_expense_category'),
      href: '/settings/expense_categories/create',
    },
  ];

  return (
    <Settings title={t('expense_categories')} breadcrumbs={pages}>
      <Card title={t('create_expense_category')}>
        <CreateExpenseCategoryForm />
      </Card>
    </Settings>
  );
}
