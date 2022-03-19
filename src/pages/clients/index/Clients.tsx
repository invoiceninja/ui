/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Link } from '@invoiceninja/forms';
import { date } from 'common/helpers';
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';
import { useTitle } from 'common/hooks/useTitle';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { DataTable, DataTableColumns } from 'components/DataTable';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { Default } from 'components/layouts/Default';
import { useTranslation } from 'react-i18next';
import { generatePath, useNavigate } from 'react-router-dom';

export function Clients() {
  const [t] = useTranslation();

  const navigate = useNavigate();
  useTitle('clients');

  const { dateFormat } = useCurrentCompanyDateFormats();

  const pages: BreadcrumRecord[] = [{ name: t('clients'), href: '/clients' }];

  const columns: DataTableColumns = [
    {
      id: 'number',
      label: t('number'),
      format: (value, resource) => (
        <Link to={generatePath('/clients/:id', { id: resource.id })}>
          {value}
        </Link>
      ),
    },
    { id: 'name', label: t('name') },
    { id: 'balance', label: t('balance') },
    {
      id: 'paid_to_date',
      label: t('paid_to_date'),
      format: (value) => date(value, dateFormat),
    },
    {
      id: 'last_login',
      label: t('last_login'),
      format: (value) => date(value, dateFormat),
    },
  ];
  const actions = [
    (resource: any) => (
      <DropdownElement
        key={'client portal'}
        onClick={() => {
          window.open(resource.contacts[0].link, '__blank');
        }}
      >
        {t('client_portal')}
      </DropdownElement>
    ),
    (resource: any) => (
      <DropdownElement
        key={'new_payment'}
        onClick={() => {
          console.log(resource);
        }}
      >
        {t('new_payment')}
      </DropdownElement>
    ),
  ];

  return (
    <Default breadcrumbs={pages} title={t('clients')} docsLink="docs/clients">
      <DataTable
        resource="client"
        endpoint="/api/v1/clients"
        columns={columns}
        linkToCreate="/clients/create"
        linkToEdit="/clients/:id/edit"
        withResourcefulActions
        customActions={actions}
      />
    </Default>
  );
}
