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
import { Default } from '$app/components/layouts/Default';
import { useTranslation } from 'react-i18next';
import {
  defaultColumns,
  useActions,
  useAllExpenseColumns,
  useExpenseColumns,
  useExpenseFilters,
} from '../common/hooks';
import {
  useEntityTagFilterColumns,
  useTagFilterCleanup,
} from '$app/common/hooks/useEntityTagFilters';
import { TAG_ENTITY_TYPES } from '$app/common/interfaces/tag';
import { DataTableColumnsPicker } from '$app/components/DataTableColumnsPicker';
import { ImportButton } from '$app/components/import/ImportButton';
import { permission } from '$app/common/guards/guards/permission';
import { useCustomBulkActions } from '../common/hooks/useCustomBulkActions';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { Guard } from '$app/common/guards/Guard';
import { or } from '$app/common/guards/guards/or';
import {
  ChangeTemplateModal,
  useChangeTemplate,
} from '$app/pages/settings/invoice-design/pages/custom-designs/components/ChangeTemplate';
import { Expense } from '$app/common/interfaces/expense';
import { InputLabel } from '$app/components/forms';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import {
  ExpenseSlider,
  expenseSliderAtom,
  expenseSliderVisibilityAtom,
} from '../common/components/ExpenseSlider';
import { useAtom } from 'jotai';
import { useExpenseQuery } from '$app/common/queries/expenses';
import { useEffect, useState } from 'react';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';

export default function Expenses() {
  useTitle('expenses');

  const [t] = useTranslation();
  const hasPermission = useHasPermission();

  const pages = [{ name: t('expenses'), href: '/expenses' }];

  const actions = useActions();
  const filters = useExpenseFilters();
  const columns = useExpenseColumns();
  const reactSettings = useReactSettings();
  const expenseColumns = useAllExpenseColumns();
  const customBulkActions = useCustomBulkActions();

  const selectedColumns =
    reactSettings?.react_table_columns?.expense || defaultColumns;
  const shouldShowTagFilter = selectedColumns.includes('tags');
  const filterColumns = useEntityTagFilterColumns(
    TAG_ENTITY_TYPES.expense,
    'expense_tag_ids',
    { enabled: shouldShowTagFilter }
  );

  useTagFilterCleanup(shouldShowTagFilter, 'expense_tag_ids');

  const disableNavigation = useDisableNavigation();

  const [sliderExpenseId, setSliderExpenseId] = useState<string>('');
  const [expenseSlider, setExpenseSlider] = useAtom(expenseSliderAtom);
  const [expenseSliderVisibility, setExpenseSliderVisibility] = useAtom(
    expenseSliderVisibilityAtom
  );

  const { data: expenseResponse } = useExpenseQuery({
    id: sliderExpenseId,
    enabled: Boolean(sliderExpenseId),
  });

  useEffect(() => {
    setExpenseSlider(null);
  }, [sliderExpenseId]);

  useEffect(() => {
    if (expenseResponse && expenseSliderVisibility) {
      setExpenseSlider(expenseResponse);
    }
  }, [expenseResponse, expenseSliderVisibility]);

  useEffect(() => {
    return () => setExpenseSliderVisibility(false);
  }, []);

  const {
    changeTemplateVisible,
    setChangeTemplateVisible,
    changeTemplateResources,
  } = useChangeTemplate();

  return (
    <Default title={t('expenses')} breadcrumbs={pages} docsLink="en/expenses">
      <DataTable
        resource="expense"
        endpoint={`/api/v1/expenses?include=client,vendor,category,project${
          shouldShowTagFilter ? ',tags' : ''
        }&without_deleted_clients=true&without_deleted_vendors=true&sort=id|desc${
          shouldShowTagFilter ? '' : '&tag_ids='
        }`}
        columns={columns}
        bulkRoute="/api/v1/expenses/bulk"
        linkToCreate="/expenses/create"
        linkToEdit="/expenses/:id/edit"
        customActions={actions}
        customFilters={filters}
        customBulkActions={customBulkActions}
        customFilterPlaceholder="status"
        filterColumns={shouldShowTagFilter ? filterColumns : undefined}
        withResourcefulActions
        rightSide={
          <div className="flex items-center space-x-2">
            <DataTableColumnsPicker
              columns={expenseColumns as unknown as string[]}
              defaultColumns={defaultColumns}
              table="expense"
            />

            <Guard
              type="component"
              guards={[
                or(permission('create_expense'), permission('edit_expense')),
              ]}
              component={<ImportButton route="/expenses/import" />}
            />
          </div>
        }
        linkToCreateGuards={[permission('create_expense')]}
        hideEditableOptions={!hasPermission('edit_expense')}
        enableSavingFilterPreference
        dateRangeColumns={[
          { column: 'date', queryParameterKey: 'date_range' },
          { column: 'created_at', queryParameterKey: 'created_between' },
        ]}
        enableSavingLatestDataForNavigation
        onTableRowClick={(expense) => {
          setSliderExpenseId(expense.id);
          setExpenseSliderVisibility(true);
        }}
      />

      {!disableNavigation('expense', expenseSlider) && <ExpenseSlider />}

      <ChangeTemplateModal<Expense>
        entity="expense"
        entities={changeTemplateResources as Expense[]}
        visible={changeTemplateVisible}
        setVisible={setChangeTemplateVisible}
        labelFn={(expense) => (
          <div className="flex flex-col space-y-1">
            <InputLabel>{t('number')}</InputLabel>

            <span>{expense.number}</span>
          </div>
        )}
        bulkLabelFn={(expense) => (
          <div className="flex space-x-2">
            <InputLabel>{t('number')}:</InputLabel>

            <span>{expense.number}</span>
          </div>
        )}
        bulkUrl="/api/v1/expenses/bulk"
      />
    </Default>
  );
}
