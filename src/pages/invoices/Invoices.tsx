/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { DataTableColumns, DataTable } from 'components/DataTable';
import { date } from 'common/helpers';
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Default } from '../../components/layouts/Default';

export function Invoices() {
  const [t] = useTranslation();

  const pages = [{ name: t('invoices'), href: '/invoices' }];
  const { dateFormat } = useCurrentCompanyDateFormats();

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t('invoices')}`;
  });

  const columns: DataTableColumns = [
    {
      id: 'status',
      label: t('status'),
    },
    { id: 'number', label: t('number') },
    { id: 'client', label: t('client') },
    {
      id: 'amount',
      label: t('amount'),
    },
    {
      id: 'balance',
      label: t('balance'),
    },
    {
      id: 'date',
      label: t('date'),
      format: (value) => date(value, dateFormat),
    },
    {
      id: 'due date',
      label: t('due date'),
      format: (value) => date(value, dateFormat),
    },
  ];

  return (
    <Default title={t('invoices')} breadcrumbs={pages}>
      <DataTable
        resource="invoice"
        endpoint="/api/v1/invoices"
        columns={columns}
        linkToCreate="/invoices/create"
        linkToEdit="/invoices/:id/edit"
        withResourcefulActions
      />
    </Default>
  );
}
