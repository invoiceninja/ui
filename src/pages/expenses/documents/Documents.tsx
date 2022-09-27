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
import { useExpenseQuery } from 'common/queries/expenses';
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
    { name: t('expenses'), href: '/expenses' },
    { name: t('expense'), href: route('/expenses/:id/edit', { id }) },
    {
      name: t('documents'),
      href: route('/expenses/:id/documents', { id }),
    },
  ];

  const tabs: Tab[] = [
    {
      name: t('edit'),
      href: route('/expenses/:id/edit', { id }),
    },
    {
      name: t('documents'),
      href: route('/expenses/:id/documents', { id }),
    },
  ];

  const { data: expense } = useExpenseQuery({ id });

  const queryClient = useQueryClient();

  const invalidateCache = () => {
    queryClient.invalidateQueries(route('/api/v1/expenses/:id', { id }));
  };

  return (
    <Default title={documentTitle} breadcrumbs={pages}>
      <div className="space-y-4">
        <Tabs tabs={tabs} />

        <Upload
          widgetOnly
          endpoint={endpoint('/api/v1/expenses/:id/upload', { id })}
          onSuccess={invalidateCache}
        />

        <DocumentsTable
          documents={expense?.documents || []}
          onDocumentDelete={invalidateCache}
        />
      </div>
    </Default>
  );
}
