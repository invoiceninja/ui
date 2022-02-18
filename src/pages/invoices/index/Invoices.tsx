/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { date } from 'common/helpers';
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';
import { useTitle } from 'common/hooks/useTitle';
import { DataTable, DataTableColumns } from 'components/DataTable';
import { EntityStatus } from 'components/EntityStatus';
import { Default } from 'components/layouts/Default';
import { useTranslation } from 'react-i18next';
import { generatePath, Link, Link as RouterLink } from 'react-router-dom';

export function Invoices() {
  const [t] = useTranslation();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const pages = [{ name: t('invoices'), href: '/invoices' }];
  const columns: DataTableColumns = [
    {id:'status',label:t('status'), format: (value, resource) => (
      <Link to={generatePath('/clients/:id', { id: resource.id })}>
                  <EntityStatus entity={resource} />

        {value}
      </Link>
    ) },
    {
      id: 'number',
      label: t('number'),
     
    },{id:'name',label:t('name')},
    { id: 'amount', label: t('amount') },
    { id: 'balance', label: t('balance') },
    {
      id: 'date',
      label: t('date'),
      format: (value) => date(value, dateFormat),
    },
    {
      id: 'due_date',
      label: t('due_date'),
      format: (value) => date(value, dateFormat),
    },
  ];
  useTitle('invoices');

  return (
    <Default title={t('invoices')} breadcrumbs={pages} docsLink="docs/invoices">
      <DataTable
      resource="invoices"
      endpoint="/api/v1/invoices"
      columns={columns}
      linkToCreate="/invoices/create"
      linkToEdit="/invoices/:id/edit"
      withResourcefulActions
      ></DataTable>
      <RouterLink to="/invoices/create">Create an invoice</RouterLink>
    </Default>
  );
}
