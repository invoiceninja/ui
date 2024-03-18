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
import {
  ChangeTemplateModal,
  useChangeTemplate,
} from '$app/pages/settings/invoice-design/pages/custom-designs/components/ChangeTemplate';
import { Credit } from '$app/common/interfaces/credit';

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

  const {
    changeTemplateVisible,
    setChangeTemplateVisible,
    changeTemplateResources,
  } = useChangeTemplate();

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
        customFilters={filters}
        customFilterPlaceholder="status"
        withResourcefulActions
        leftSideChevrons={
          <DataTableColumnsPicker
            columns={creditColumns as unknown as string[]}
            defaultColumns={defaultColumns}
            table="credit"
          />
        }
        linkToCreateGuards={[permission('create_credit')]}
        hideEditableOptions={!hasPermission('edit_credit')}
      />

      <ChangeTemplateModal<Credit>
        entity="credit"
        entities={changeTemplateResources as Credit[]}
        visible={changeTemplateVisible}
        setVisible={setChangeTemplateVisible}
        labelFn={(credit) => `${t('number')}: ${credit.number}`}
        bulkUrl="/api/v1/credits/bulk"
      />
    </Default>
  );
}
