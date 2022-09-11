/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Link } from '@invoiceninja/forms';
import { date } from 'common/helpers';
import { useFormatMoney } from 'common/hooks/money/useFormatMoney';
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';
import { useTitle } from 'common/hooks/useTitle';
import { Client } from 'common/interfaces/client';
import { Page } from 'components/Breadcrumbs';
import { DataTable, DataTableColumns } from 'components/DataTable';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { Default } from 'components/layouts/Default';
import { Download } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { generatePath } from 'react-router-dom';
import { Link as ReactRouterLink } from 'react-router-dom';

export function Clients() {
  useTitle('clients');

  const [t] = useTranslation();

  const formatMoney = useFormatMoney();

  const { dateFormat } = useCurrentCompanyDateFormats();

  const pages: Page[] = [{ name: t('clients'), href: '/clients' }];

  const columns: DataTableColumns = [
    {
      id: 'number',
      label: t('number'),
    },
    { 
      id: 'display_name', 
      label: t('name') ,
      format: (value, resource) => (
        <Link to={generatePath('/clients/:id', { id: resource.id })}>
          {value}
        </Link>
      ),
    },
    {
      id: 'balance',
      label: t('balance'),
      format: (value, resource) =>
        formatMoney(
          value,
          resource?.country_id,
          resource?.settings.currency_id
        ),
    },
    {
      id: 'paid_to_date',
      label: t('paid_to_date'),
      format: (value, resource) =>
        formatMoney(
          value,
          resource?.country_id,
          resource?.settings.currency_id
        ),
    },
    {
      id: 'last_login',
      label: t('last_login'),
      format: (value) => date(value, dateFormat),
    },
  ];

  const importButton = (
    <ReactRouterLink to="/clients/import">
      <button className="inline-flex items-center justify-center py-2 px-4 rounded text-sm text-white bg-green-500 hover:bg-green-600">
        <svg
          className="w-4 h-4 mr-2"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="3 3 20 20"
        >
          <Download />
        </svg>
        <span>{t('import')}</span>
      </button>
    </ReactRouterLink>
  );

  const actions = [
    (resource: Client) => (
      <DropdownElement
        key={'client portal'}
        onClick={() => window.open(resource.contacts[0].link, '__blank')}
      >
        {t('client_portal')}
      </DropdownElement>
    ),
    (resource: Client) => (
      <DropdownElement
        key={'new_invoice'}
        to={generatePath('/invoices/create?client=:id', { id: resource.id })}
      >
        {t('new_invoice')}
      </DropdownElement>
    ),
    (resource: Client) => (
      <DropdownElement
        key={'new_payment'}
        to={generatePath('/payments/create?client=:id', { id: resource.id })}
      >
        {t('new_payment')}
      </DropdownElement>
    ),
    (resource: Client) => (
      <DropdownElement
        key={'new_quote'}
        to={generatePath('/quotes/create?client=:id', { id: resource.id })}
      >
        {t('new_quote')}
      </DropdownElement>
    ),
    (resource: Client) => (
      <DropdownElement
        key={'new_credit'}
        to={generatePath('/credits/create?client=:id', { id: resource.id })}
      >
        {t('new_credit')}
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
        rightSide={importButton}
      />
    </Default>
  );
}
