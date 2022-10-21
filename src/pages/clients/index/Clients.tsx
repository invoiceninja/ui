/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from 'common/hooks/useTitle';
import { Client } from 'common/interfaces/client';
import { Page } from 'components/Breadcrumbs';
import { DataTable } from 'components/DataTable';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { Default } from 'components/layouts/Default';
import { Download } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { route } from 'common/helpers/route';
import { Link as ReactRouterLink } from 'react-router-dom';
import { useClientColumns } from '../common/hooks/useClientColumns';

export function Clients() {
  useTitle('clients');

  const [t] = useTranslation();

  const pages: Page[] = [{ name: t('clients'), href: '/clients' }];

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
        to={route('/clients/:id/statement', { id: resource.id })}
      >
        {t('view_statement')}
      </DropdownElement>
    ),
    (resource: Client) => (
      <DropdownElement
        onClick={() => window.open(resource.contacts[0].link, '__blank')}
      >
        {t('client_portal')}
      </DropdownElement>
    ),
    (resource: Client) => (
      <DropdownElement
        to={route('/invoices/create?client=:id', { id: resource.id })}
      >
        {t('new_invoice')}
      </DropdownElement>
    ),
    (resource: Client) => (
      <DropdownElement
        to={route('/payments/create?client=:id', { id: resource.id })}
      >
        {t('new_payment')}
      </DropdownElement>
    ),
    (resource: Client) => (
      <DropdownElement
        to={route('/quotes/create?client=:id', { id: resource.id })}
      >
        {t('new_quote')}
      </DropdownElement>
    ),
    (resource: Client) => (
      <DropdownElement
        to={route('/credits/create?client=:id', { id: resource.id })}
      >
        {t('new_credit')}
      </DropdownElement>
    ),
  ];

  const columns = useClientColumns();

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
