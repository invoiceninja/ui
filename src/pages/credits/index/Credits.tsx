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
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';

export default function Credits() {
  useTitle('credits');

  const [t] = useTranslation();

  const hasPermission = useHasPermission();

  const pages = [{ name: t('credits'), href: '/credits' }];

  const actions = useActions();
  const columns = useCreditColumns();

  const creditColumns = useAllCreditColumns();

  const customBulkActions = useCustomBulkActions();

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
        linkToCreate="/credits/create"
        linkToEdit="/credits/:id/edit"
        customActions={actions}
        customBulkActions={customBulkActions}
        withResourcefulActions
        leftSideChevrons={
          <DataTableColumnsPicker
            columns={creditColumns as unknown as string[]}
            defaultColumns={defaultColumns}
            table="credit"
          />
        }
        linkToCreateGuards={[permission('create_credit')]}
        showEditEntityOptions={hasPermission('edit_credit')}
      />
    </Default>
  );
}
