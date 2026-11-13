/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { blankLineItem } from '$app/common/constants/blank-line-item';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { Expense } from '$app/common/interfaces/expense';
import {
  InvoiceItem,
  InvoiceItemType,
} from '$app/common/interfaces/invoice-item';
import { Product } from '$app/common/interfaces/product';
import { Task } from '$app/common/interfaces/task';
import { calculateTaskHours } from '$app/pages/projects/common/hooks/useInvoiceProject';

export type WorkSource = 'saved' | 'work';

export interface WorkRow {
  id: string;
  title: string;
  detail?: string;
  tag?: string;
  amount: number;
  build: () => InvoiceItem;
}

export const productFields = (product: Product): Partial<InvoiceItem> => {
  return {
    type_id: InvoiceItemType.Product,
    product_key: product.product_key,
    notes: product.notes || product.product_key,
    cost: product.price,
    quantity: product.quantity || 1,
    tax_name1: product.tax_name1,
    tax_rate1: product.tax_rate1,
    tax_name2: product.tax_name2,
    tax_rate2: product.tax_rate2,
    tax_name3: product.tax_name3,
    tax_rate3: product.tax_rate3,
    tax_id: product.tax_id || '1',
  };
};

export const productToItem = (product: Product): InvoiceItem => {
  return { ...blankLineItem(), ...productFields(product) };
};

export const loadWorkRows = (
  source: WorkSource,
  query: string,
  clientId: string
): Promise<WorkRow[]> => {
  if (source === 'saved') {
    return request(
      'GET',
      endpoint(
        '/api/v1/products?status=active&per_page=50&sort=product_key|asc&filter=:filter',
        { filter: encodeURIComponent(query.trim()) }
      ),
      {},
      { skipIntercept: true }
    ).then((response) =>
      (response.data.data as Product[]).map((product) => ({
        id: product.id,
        title: product.product_key || product.notes,
        detail: product.product_key ? product.notes : undefined,
        amount: product.price,
        build: () => productToItem(product),
      }))
    );
  }

  if (!clientId) {
    return Promise.resolve([]);
  }

  return Promise.all([
    request(
      'GET',
      endpoint(
        '/api/v1/tasks?status=active&client_status=uninvoiced&per_page=50&client_id=:id',
        { id: clientId }
      ),
      {},
      { skipIntercept: true }
    )
      .then((response) => response.data.data as Task[])
      .catch(() => [] as Task[]),
    request(
      'GET',
      endpoint(
        '/api/v1/expenses?status=active&client_status=pending&per_page=50&client_id=:id',
        { id: clientId }
      ),
      {},
      { skipIntercept: true }
    )
      .then((response) => response.data.data as Expense[])
      .catch(() => [] as Expense[]),
  ]).then(([tasks, expenses]) => {
    const taskRows: WorkRow[] = tasks
      .filter((task) => !task.invoice_id)
      .map((task) => {
        const hours = calculateTaskHours(task.time_log);

        return {
          id: `task-${task.id}`,
          title: task.description || `Task ${task.number}`,
          tag: 'task',
          detail: `${hours} h`,
          amount: (task.rate || 0) * hours,
          build: () => ({
            ...blankLineItem(),
            type_id: InvoiceItemType.Task,
            task_id: task.id,
            notes: task.description || `Task ${task.number}`,
            quantity: hours,
            cost: task.rate || 0,
          }),
        };
      });

    const expenseRows: WorkRow[] = expenses
      .filter((expense) => !expense.invoice_id && expense.should_be_invoiced)
      .map((expense) => {
        const cost =
          expense.foreign_amount > 0 ? expense.foreign_amount : expense.amount;

        return {
          id: `expense-${expense.id}`,
          title: expense.public_notes || `Expense ${expense.number}`,
          tag: 'expense',
          detail: expense.date,
          amount: cost,
          build: () => ({
            ...blankLineItem(),
            type_id: InvoiceItemType.Product,
            expense_id: expense.id,
            notes: expense.public_notes || `Expense ${expense.number}`,
            quantity: 1,
            cost,
            tax_name1: expense.tax_name1,
            tax_rate1: taxRateOf(
              expense,
              expense.tax_amount1,
              expense.tax_rate1
            ),
            tax_name2: expense.tax_name2,
            tax_rate2: taxRateOf(
              expense,
              expense.tax_amount2,
              expense.tax_rate2
            ),
            tax_name3: expense.tax_name3,
            tax_rate3: taxRateOf(
              expense,
              expense.tax_amount3,
              expense.tax_rate3
            ),
          }),
        };
      });

    return [...taskRows, ...expenseRows];
  });
};

const taxRateOf = (
  expense: Expense,
  amount: number,
  fallback: number
): number => {
  if (!expense.calculate_tax_by_amount) {
    return fallback;
  }

  if (expense.uses_inclusive_taxes) {
    return Math.round(((amount / expense.amount) * 100 * 1000) / 10) / 100;
  }

  return Math.round(((amount / expense.amount) * 1000) / 10) / 1;
};
