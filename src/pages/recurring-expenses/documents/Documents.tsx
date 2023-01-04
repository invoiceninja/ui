/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from 'common/helpers';
import { route } from 'common/helpers/route';
import { useTitle } from 'common/hooks/useTitle';
import { useRecurringExpenseQuery } from 'common/queries/recurring-expense';
import { Page } from 'components/Breadcrumbs';
import { DocumentsTable } from 'components/DocumentsTable';
import { Default } from 'components/layouts/Default';
import { Tab, Tabs } from 'components/Tabs';
import { Upload } from 'pages/settings/company/documents/components';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useParams } from 'react-router-dom';

export function Documents() {
  const [t] = useTranslation();

  const { documentTitle } = useTitle('documents');

  const { id } = useParams();

  const pages: Page[] = [
    { name: t('recurring_expenses'), href: '/recurring_expenses' },
    {
      name: t('recurring_expense'),
      href: route('/recurring_expenses/:id/edit', { id }),
    },
    {
      name: t('documents'),
      href: route('/recurring_expenses/:id/documents', { id }),
    },
  ];

  const tabs: Tab[] = [
    {
      name: t('edit'),
      href: route('/recurring_expenses/:id/edit', { id }),
    },
    {
      name: t('documents'),
      href: route('/recurring_expenses/:id/documents', { id }),
    },
  ];

  const { data: recurringExpense } = useRecurringExpenseQuery({ id });

  const queryClient = useQueryClient();

  const invalidateCache = () => {
    queryClient.invalidateQueries(
      route('/api/v1/recurring_expenses/:id', { id })
    );
  };

  return (
    <Default title={documentTitle} breadcrumbs={pages}>
      <div className="space-y-4">
        <Tabs tabs={tabs} />

        <div className="w-2/3">
          <Upload
            widgetOnly
            endpoint={endpoint('/api/v1/recurring_expenses/:id/upload', {
              id,
            })}
            onSuccess={invalidateCache}
          />

          <DocumentsTable
            documents={recurringExpense?.documents || []}
            onDocumentDelete={invalidateCache}
          />
        </div>
      </div>
    </Default>
  );
}
