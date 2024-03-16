/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from '$app/common/hooks/useTitle';
import { DataTable } from '$app/components/DataTable';
import { DataTableColumnsPicker } from '$app/components/DataTableColumnsPicker';
import { Default } from '$app/components/layouts/Default';
import { useTranslation } from 'react-i18next';
import {
  defaultColumns,
  useActions,
  useAllCreditColumns,
  useCreditColumns,
} from '../common/hooks';
import { permission } from '$app/common/guards/guards/permission';
import { useCustomBulkActions } from '../common/hooks/useCustomBulkActions';
import { useCreditsFilters } from '../common/hooks/useCreditsFilters';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useFooterColumns } from '../common/hooks/useFooterColumns';
import { DataTableFooterColumnsPicker } from '$app/components/DataTableFooterColumnsPicker';

export default function Credits() {
  useTitle('credits');

  const [t] = useTranslation();
  const hasPermission = useHasPermission();

  const pages = [{ name: t('credits'), href: '/credits' }];

  const actions = useActions();
  const columns = useCreditColumns();
  const filters = useCreditsFilters();
  const creditColumns = useAllCreditColumns();
  const customBulkActions = useCustomBulkActions();
  const { footerColumns, allFooterColumns } = useFooterColumns();

  return (
    <Default
      title={t('credits')}
      breadcrumbs={pages}
      docsLink="en/credits/"
      withoutBackButton
    >
      <DataTable
        resource="credit"
        endpoint="/api/v1/credits?include=client&without_deleted_clients=true&sort=id|desc"
        bulkRoute="/api/v1/credits/bulk"
        columns={columns}
        footerColumns={footerColumns}
        linkToCreate="/credits/create"
        linkToEdit="/credits/:id/edit"
        customActions={actions}
        customBulkActions={customBulkActions}
        customFilters={filters}
        customFilterPlaceholder="status"
        withResourcefulActions
        leftSideChevrons={
          <div className="flex space-x-2 pr-4">
            <DataTableFooterColumnsPicker
              table="credit"
              columns={allFooterColumns}
            />

            <DataTableColumnsPicker
              columns={creditColumns as unknown as string[]}
              defaultColumns={defaultColumns}
              table="credit"
            />
          </div>
        }
        linkToCreateGuards={[permission('create_credit')]}
        hideEditableOptions={!hasPermission('edit_credit')}
      />
    </Default>
  );
}
