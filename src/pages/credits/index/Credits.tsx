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
import { DataTable, filterColumnsValuesAtom } from '$app/components/DataTable';
import { DataTableColumnsPicker } from '$app/components/DataTableColumnsPicker';
import { Default } from '$app/components/layouts/Default';
import { useTranslation } from 'react-i18next';
import {
  defaultColumns,
  useActions,
  useAllCreditColumns,
  useCreditColumns,
  useCreditFilterColumns,
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
import { useDateRangeColumns } from '../common/hooks/useDateRangeColumns';
import { useSocketEvent } from '$app/common/queries/sockets';
import { $refetch } from '$app/common/hooks/useRefetch';
import { InputLabel } from '$app/components/forms';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { useAtom } from 'jotai';
import { useEffect } from 'react';

export default function Credits() {
  useTitle('credits');

  const [t] = useTranslation();
  const hasPermission = useHasPermission();

  const pages = [{ name: t('credits'), href: '/credits' }];

  const actions = useActions();
  const columns = useCreditColumns();
  const filters = useCreditsFilters();
  const reactSettings = useReactSettings();
  const creditColumns = useAllCreditColumns();
  const dateRangeColumns = useDateRangeColumns();
  const customBulkActions = useCustomBulkActions();

  const selectedColumns =
    reactSettings?.react_table_columns?.credit || defaultColumns;
  const shouldShowTagFilter = selectedColumns.includes('tags');
  const filterColumns = useCreditFilterColumns({
    enabled: shouldShowTagFilter,
  });

  const [filterColumnsValues, setFilterColumnsValues] = useAtom(
    filterColumnsValuesAtom
  );

  const {
    changeTemplateVisible,
    setChangeTemplateVisible,
    changeTemplateResources,
  } = useChangeTemplate();

  useEffect(() => {
    if (!shouldShowTagFilter && filterColumnsValues.credit_tag_ids?.length) {
      setFilterColumnsValues((current) => {
        const { credit_tag_ids, ...rest } = current;

        return rest;
      });
    }
  }, [
    shouldShowTagFilter,
    filterColumnsValues.credit_tag_ids,
    setFilterColumnsValues,
  ]);

  useSocketEvent({
    on: [
      'App\\Events\\Credit\\CreditWasCreated',
      'App\\Events\\Credit\\CreditWasUpdated',
    ],
    callback: () => $refetch(['credits']),
  });

  return (
    <Default title={t('credits')} breadcrumbs={pages} docsLink="en/credits/">
      <DataTable
        resource="credit"
        endpoint={`/api/v1/credits?include=client${
          shouldShowTagFilter ? ',tags' : ''
        }&without_deleted_clients=true&sort=id|desc${
          shouldShowTagFilter ? '' : '&tag_ids='
        }`}
        bulkRoute="/api/v1/credits/bulk"
        columns={columns}
        linkToCreate="/credits/create"
        linkToEdit="/credits/:id/edit"
        customActions={actions}
        customBulkActions={customBulkActions}
        customFilters={filters}
        customFilterPlaceholder="status"
        filterColumns={shouldShowTagFilter ? filterColumns : undefined}
        withResourcefulActions
        rightSide={
          <DataTableColumnsPicker
            columns={creditColumns as unknown as string[]}
            defaultColumns={defaultColumns}
            table="credit"
          />
        }
        dateRangeColumns={dateRangeColumns}
        linkToCreateGuards={[permission('create_credit')]}
        hideEditableOptions={!hasPermission('edit_credit')}
        enableSavingFilterPreference
        enableSavingLatestDataForNavigation
      />

      <ChangeTemplateModal<Credit>
        entity="credit"
        entities={changeTemplateResources as Credit[]}
        visible={changeTemplateVisible}
        setVisible={setChangeTemplateVisible}
        labelFn={(credit) => (
          <div className="flex flex-col space-y-1">
            <InputLabel>{t('number')}</InputLabel>

            <span>{credit.number}</span>
          </div>
        )}
        bulkLabelFn={(credit) => (
          <div className="flex space-x-2">
            <InputLabel>{t('number')}:</InputLabel>

            <span>{credit.number}</span>
          </div>
        )}
        bulkUrl="/api/v1/credits/bulk"
      />
    </Default>
  );
}
