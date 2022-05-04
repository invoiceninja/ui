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
import { DataTable, DataTableColumns } from 'components/DataTable';
import { generatePath } from 'react-router-dom';

export function ExpenseCategories() {
  const columns: DataTableColumns = [
    {
      id: 'category',
      label: 'name',
      format: (value, resource) => (
        <Link
          to={generatePath('/settings/expense_categories/:id/edit', {
            id: resource.id,
          })}
        >
          {resource.name}
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
