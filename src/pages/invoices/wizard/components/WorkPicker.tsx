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
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useColorScheme } from '$app/common/colors';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { Expense } from '$app/common/interfaces/expense';
import {
  InvoiceItem,
  InvoiceItemType,
} from '$app/common/interfaces/invoice-item';
import { Product } from '$app/common/interfaces/product';
import { Task } from '$app/common/interfaces/task';
import { Modal } from '$app/components/Modal';
import { Spinner } from '$app/components/Spinner';
import { InputField } from '$app/components/forms';
import { calculateTaskHours } from '$app/pages/projects/common/hooks/useInvoiceProject';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export type WorkSource = 'saved' | 'work';

interface Props {
  open: boolean;
  source: WorkSource;
  clientId: string;
  onClose: () => void;
  onPick: (item: InvoiceItem) => void;
}

interface Row {
  id: string;
  title: string;
  detail?: string;
  tag?: string;
  amount: number;
  build: () => InvoiceItem;
}

export function WorkPicker({ open, source, clientId, onClose, onPick }: Props) {
  const colors = useColorScheme();
  const [t] = useTranslation();
  const formatMoney = useFormatMoney();

  const [query, setQuery] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setQuery('');
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    setLoading(true);

    load(source, query, clientId)
      .then((result) => !cancelled && setRows(result))
      .catch(() => !cancelled && setRows([]))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [open, source, query, clientId]);

  return (
    <Modal
      visible={open}
      onClose={onClose}
      title={
        source === 'saved'
          ? t('choose_a_saved_item')
          : t('add_from_existing_work')
      }
      size="small"
    >
      {source === 'saved' ? (
        <div className="mb-3">
          <InputField
            id="iw-item-search"
            placeholder={t('search_products')}
            value={query}
            changeOverride
            onValueChange={setQuery}
          />
        </div>
      ) : null}

      {loading ? (
        <div className="py-10 flex justify-center">
          <Spinner />
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm py-10 text-center" style={{ color: colors.$17 }}>
          {t(emptyCopy(source, Boolean(clientId)))}
        </p>
      ) : (
        <div className="space-y-2">
          {rows.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => {
                onPick(row.build());
                onClose();
              }}
              className="w-full text-left px-3.5 py-3 flex items-start justify-between gap-4 border"
              style={{
                borderColor: colors.$24,
                borderRadius: '0.375rem',
                backgroundColor: colors.$1,
              }}
              onMouseEnter={(event) =>
                (event.currentTarget.style.backgroundColor = colors.$25)
              }
              onMouseLeave={(event) =>
                (event.currentTarget.style.backgroundColor = colors.$1)
              }
            >
              <span className="min-w-0">
                <span className="block text-sm" style={{ color: colors.$3 }}>
                  {row.title}
                </span>

                {row.detail || row.tag ? (
                  <span
                    className="block text-xs mt-0.5"
                    style={{ color: colors.$17 }}
                  >
                    {[row.tag ? t(row.tag) : '', row.detail]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                ) : null}
              </span>

              <span
                className="text-sm shrink-0"
                style={{
                  color: colors.$3,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {formatMoney(row.amount, undefined, undefined, 2)}
              </span>
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}

const load = (
  source: WorkSource,
  query: string,
  clientId: string
): Promise<Row[]> => {
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
        build: () => ({
          ...blankLineItem(),
          type_id: InvoiceItemType.Product,
          product_key: product.product_key,
          notes: product.notes,
          cost: product.price,
          quantity: product.quantity || 1,
          tax_name1: product.tax_name1,
          tax_rate1: product.tax_rate1,
          tax_name2: product.tax_name2,
          tax_rate2: product.tax_rate2,
          tax_name3: product.tax_name3,
          tax_rate3: product.tax_rate3,
          tax_id: product.tax_id || '1',
        }),
      }))
    );
  }

  if (!clientId) {
    return Promise.resolve([]);
  }

  return Promise.all([
    request(
      'GET',
      endpoint('/api/v1/tasks?status=active&per_page=50&client_id=:id', {
        id: clientId,
      }),
      {},
      { skipIntercept: true }
    )
      .then((response) => response.data.data as Task[])
      .catch(() => [] as Task[]),
    request(
      'GET',
      endpoint('/api/v1/expenses?status=active&per_page=50&client_id=:id', {
        id: clientId,
      }),
      {},
      { skipIntercept: true }
    )
      .then((response) => response.data.data as Expense[])
      .catch(() => [] as Expense[]),
  ]).then(([tasks, expenses]) => {
    const taskRows: Row[] = tasks
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

    const expenseRows: Row[] = expenses
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

const emptyCopy = (source: WorkSource, hasClient: boolean): string => {
  if (source === 'saved') {
    return 'no_saved_products';
  }

  if (!hasClient) {
    return 'choose_a_customer_first';
  }

  return 'no_unbilled_work';
};
