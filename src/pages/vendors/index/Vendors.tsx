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
import { Page } from 'components/Breadcrumbs';
import { DataTable } from 'components/DataTable';
import { Default } from 'components/layouts/Default';
import { useTranslation } from 'react-i18next';
import {
  defaultColumns,
  useVendorColumns,
  vendorColumns,
} from '../common/hooks';
import { DataTableColumnsPicker } from 'components/DataTableColumnsPicker';
import { ImportButton } from 'components/import/ImportButton';

export function Vendors() {
  const { documentTitle } = useTitle('vendors');

  const [t] = useTranslation();

  const pages: Page[] = [{ name: t('vendors'), href: '/vendors' }];

  const columns = useVendorColumns();

  return (
    <Default title={documentTitle} breadcrumbs={pages}>
      <DataTable
        resource="vendor"
        columns={columns}
        endpoint="/api/v1/vendors"
        linkToCreate="/vendors/create"
        linkToEdit="/vendors/:id/edit"
        withResourcefulActions
        rightSide={<ImportButton route="/vendors/import" />}
        leftSideChevrons={
          <DataTableColumnsPicker
            columns={vendorColumns as unknown as string[]}
            defaultColumns={defaultColumns}
            table="vendor"
          />
        }
      />
    </Default>
  );
}
