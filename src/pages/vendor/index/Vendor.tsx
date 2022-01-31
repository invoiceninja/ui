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
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { DataTable, DataTableColumns } from 'components/DataTable';
import { Default } from 'components/layouts/Default';
import { useTranslation } from 'react-i18next';

export function Vendors() {
  const [t] = useTranslation();

  useTitle('vendors');

  const { dateFormat } = useCurrentCompanyDateFormats();

  const pages: BreadcrumRecord[] = [{ name: t('vendors'), href: '/vendors' }];

  const columns: DataTableColumns = [
    {
      id: 'vendor',
      label: t('vendor'),
    },
    { id: 'name', label: t('name') },
    { id: 'city', label: t('city') },
    {
      id: 'phone',
      label: t('phone'),
    },
    {
      id: 'entity state',
      label: t('entity state'),
    },
    {
      id: 'created At',
      label: t('created At'),
      format: (value) => date(value, dateFormat),
    },
  ];

  return (
    <Default breadcrumbs={pages} title={t('vendors')}>
      <DataTable
        resource="invoice"
        endpoint="api/v1/vendors"
        columns={columns}
        linkToCreate="/vendors/create"
        linkToEdit="/vendors/:id/edit"
        withResourcefulActions
      />
    </Default>
  );
}
