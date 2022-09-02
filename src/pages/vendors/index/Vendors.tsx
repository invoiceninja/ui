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
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';
import { useTitle } from 'common/hooks/useTitle';
import { Vendor } from 'common/interfaces/vendor';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { DataTable, DataTableColumns } from 'components/DataTable';
import { EntityStatus } from 'components/EntityStatus';
import { Default } from 'components/layouts/Default';
import { useTranslation } from 'react-i18next';
import { generatePath } from 'react-router-dom';
import { Link as ReactRouterLink } from 'react-router-dom';
import { Download } from 'react-feather';

export function Vendors() {
  const { documentTitle } = useTitle('vendors');

  const [t] = useTranslation();

  const pages: BreadcrumRecord[] = [{ name: t('vendors'), href: '/vendors' }];

  const { dateFormat } = useCurrentCompanyDateFormats();

  const importButton = (
    <ReactRouterLink to="/expenses/import">
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

  const columns: DataTableColumns<Vendor> = [
    {
      id: 'number',
      label: t('number'),
      format: (value, vendor) => (
        <Link to={generatePath('/vendors/:id', { id: vendor.id })}>
          {value}
        </Link>
      ),
    },
    {
      id: 'name',
      label: t('name'),
      format: (value, vendor) => (
        <Link to={generatePath('/vendors/:id', { id: vendor.id })}>
          {value}
        </Link>
      ),
    },
    {
      id: 'city',
      label: t('city'),
    },
    {
      id: 'phone',
      label: t('phone'),
    },
    {
      id: 'entiy_state',
      label: t('entity_state'),
      format: (value, vendor) => <EntityStatus entity={vendor} />,
    },
    {
      id: 'created_at',
      label: t('created_at'),
      format: (value) => date(value, dateFormat),
    },
  ];

  return (
    <Default title={documentTitle} breadcrumbs={pages}>
      <DataTable
        resource="vendor"
        columns={columns}
        endpoint="/api/v1/vendors"
        linkToCreate="/vendors/create"
        linkToEdit="/vendors/:id/edit"
        withResourcefulActions
        rightSide={importButton}
      />
    </Default>
  );
}
