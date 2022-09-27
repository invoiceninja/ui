/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Link } from '@invoiceninja/forms';
import { ExpenseCategory } from 'common/interfaces/expense-category';
import { DataTable, DataTableColumns } from 'components/DataTable';
import { route } from 'common/helpers/route';

export function ExpenseCategories() {
  const columns: DataTableColumns<ExpenseCategory> = [
    {
      id: 'category',
      label: 'name',
      format: (value, expenseCategory) => (
        <Link
          to={route('/settings/expense_categories/:id/edit', {
            id: expenseCategory.id,
          })}
        >
          {expenseCategory.name}
        </Link>
      ),
    },
    {
      id: 'color',
      label: 'color',
      format: (value) => (
        <div
          style={{ backgroundColor: value as string }}
          className="p-1 h-4 w-10"
        ></div>
      ),
    },
  ];

  return (
    <DataTable
      endpoint="/api/v1/expense_categories"
      resource="expense_category"
      columns={columns}
      linkToCreate="/settings/expense_categories/create"
      withResourcefulActions
    />
  );
}
