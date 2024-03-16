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
import { useAllExpenseColumns } from '../hooks';
import { Expense } from '$app/common/interfaces/expense';
import { useCalculateExpenseAmount } from './useCalculateExpenseAmount';

export function useFooterColumns() {
  const [t] = useTranslation();

  const reactSettings = useReactSettings();
  const expenseColumns = useAllExpenseColumns();

  const sumTableColumn = useSumTableColumn();
  const calculateExpenseAmount = useCalculateExpenseAmount();

  type ExpenseColumns = (typeof expenseColumns)[number];

  const columns: DataTableFooterColumnsExtended<Expense, ExpenseColumns> = [
    {
      column: 'amount',
      id: 'amount',
      label: t('amount'),
      format: (_, expenses) =>
        sumTableColumn(
          expenses.map((expense) => calculateExpenseAmount(expense)),
          expenses
        ),
    },
  ];

  const currentColumns: string[] =
    reactSettings?.table_footer_columns?.expense || [];

  return {
    footerColumns: columns.filter(({ id }) => currentColumns.includes(id)),
    allFooterColumns: columns,
  };
}
