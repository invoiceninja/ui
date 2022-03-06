/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { date } from 'common/helpers';
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';
import { DataTable, DataTableColumns } from 'components/DataTable';
import { EntityStatus } from 'components/EntityStatus';
import { Link } from 'components/forms/Link';
import { Default } from 'components/layouts/Default';
import { useTranslation } from 'react-i18next';
import { generatePath } from 'react-router-dom';

export function Vendors() {
  const [t] = useTranslation();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const pages = [{ name: t('vendors'), href: '/vendors' }];
  const columns: DataTableColumns = [
    {
      id: 'number',
      label: t('number'),
      format: (value, resource) => (
        <Link to={generatePath('/vendors/:id', { id: resource.id })}>
          {resource.number}
        </Link>
      ),
    },

    { id: 'name', label: t('name') },
    {
      id: 'city',
      label: t('city'),
    },
    { id: 'phone', label: t('phone') },
    {
      id: 'entiy_state',
      label: t('entity_state'),
      format: (value, resource) => <EntityStatus entity={resource} />,
    },
    {
      id: 'created_at',
      label: t('created_at'),
      format: (value) => date(value, dateFormat),
    },
  ];

  return (
    <Default title={t('vendors')} breadcrumbs={pages} docsLink="docs/vendors/">
      <DataTable
        resource="vendor"
        endpoint="/api/v1/vendors"
        columns={columns}
        linkToCreate="/vendors/create"
        linkToEdit="/vendors/:id/edit"
        withResourcefulActions
      />
    </Default>
  );
}
