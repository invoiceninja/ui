/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { useSumTableColumn } from '$app/common/hooks/useSumTableColumn';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { DataTableFooterColumnsExtended } from '$app/pages/invoices/common/hooks/useFooterColumns';
import { useCalculateExpenseAmount } from '$app/pages/expenses/common/hooks/useCalculateExpenseAmount';
import { useAllRecurringExpenseColumns } from '../hooks';
import { RecurringExpense } from '$app/common/interfaces/recurring-expense';

export function useFooterColumns() {
  const [t] = useTranslation();

  const reactSettings = useReactSettings();
  const recurringExpenseColumns = useAllRecurringExpenseColumns();

  const sumTableColumn = useSumTableColumn();
  const calculateExpenseAmount = useCalculateExpenseAmount();

  type RecurringExpenseColumns = (typeof recurringExpenseColumns)[number];

  const columns: DataTableFooterColumnsExtended<
    RecurringExpense,
    RecurringExpenseColumns
  > = [
    {
      column: 'amount',
      id: 'amount',
      label: t('amount'),
      format: (_, recurringExpenses) =>
        sumTableColumn(
          recurringExpenses.map((expense) => calculateExpenseAmount(expense)),
          recurringExpenses
        ),
    },
  ];

  const currentColumns: string[] =
    reactSettings?.table_footer_columns?.recurringExpense || [];

  return {
    footerColumns: columns.filter(({ id }) => currentColumns.includes(id)),
    allFooterColumns: columns,
  };
}
