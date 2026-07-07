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
  useAllRecurringExpenseColumns,
  useRecurringExpenseColumns,
} from '../common/hooks';
import { permission } from '$app/common/guards/guards/permission';
import { useCustomBulkActions } from '../common/hooks/useCustomBulkActions';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import {
  RecurringExpenseSlider,
  recurringExpenseSliderAtom,
  recurringExpenseSliderVisibilityAtom,
} from '../common/components/RecurringExpenseSlider';
import { useAtom } from 'jotai';
import { useRecurringExpenseQuery } from '$app/common/queries/recurring-expense';
import { useEffect, useState } from 'react';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';

export default function RecurringExpenses() {
  useTitle('recurring_expenses');

  const [t] = useTranslation();

  const hasPermission = useHasPermission();

  const pages = [
    { name: t('recurring_expenses'), href: '/recurring_expenses' },
  ];

  const columns = useRecurringExpenseColumns();

  const actions = useActions();

  const recurringExpenseColumns = useAllRecurringExpenseColumns();

  const customBulkActions = useCustomBulkActions();

  const disableNavigation = useDisableNavigation();

  const [sliderRecurringExpenseId, setSliderRecurringExpenseId] =
    useState<string>('');
  const [recurringExpenseSlider, setRecurringExpenseSlider] = useAtom(
    recurringExpenseSliderAtom
  );
  const [
    recurringExpenseSliderVisibility,
    setRecurringExpenseSliderVisibility,
  ] = useAtom(recurringExpenseSliderVisibilityAtom);

  const { data: recurringExpenseResponse } = useRecurringExpenseQuery({
    id: sliderRecurringExpenseId,
    enabled: Boolean(sliderRecurringExpenseId),
  });

  useEffect(() => {
    if (recurringExpenseResponse && recurringExpenseSliderVisibility) {
      setRecurringExpenseSlider(recurringExpenseResponse);
    }
  }, [recurringExpenseResponse, recurringExpenseSliderVisibility]);

  useEffect(() => {
    return () => setRecurringExpenseSliderVisibility(false);
  }, []);

  return (
    <Default
      title={t('recurring_expenses')}
      breadcrumbs={pages}
      docsLink="en/recurring-expenses"
    >
      <DataTable
        resource="recurring_expense"
        endpoint="/api/v1/recurring_expenses?include=client,vendor&sort=id|desc&without_deleted_clients=true&without_deleted_vendors=true"
        columns={columns}
        bulkRoute="/api/v1/recurring_expenses/bulk"
        linkToCreate="/recurring_expenses/create"
        linkToEdit="/recurring_expenses/:id/edit"
        customActions={actions}
        customBulkActions={customBulkActions}
        withResourcefulActions
        rightSide={
          <DataTableColumnsPicker
            columns={recurringExpenseColumns as unknown as string[]}
            defaultColumns={defaultColumns}
            table="recurringExpense"
          />
        }
        linkToCreateGuards={[permission('create_recurring_expense')]}
        hideEditableOptions={!hasPermission('edit_recurring_expense')}
        enableSavingFilterPreference
        dateRangeColumns={[
          { column: 'date', queryParameterKey: 'date_range' },
          { column: 'created_at', queryParameterKey: 'created_between' },
        ]}
        enableSavingLatestDataForNavigation
        onTableRowClick={(recurringExpense) => {
          setSliderRecurringExpenseId(recurringExpense.id);
          setRecurringExpenseSliderVisibility(true);
        }}
      />

      {!disableNavigation('recurring_expense', recurringExpenseSlider) && (
        <RecurringExpenseSlider />
      )}
    </Default>
  );
}
