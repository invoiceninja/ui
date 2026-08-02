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
import { useEffect, useState } from 'react';
import { Sheet, Spinner, TextField, useTheme, radius } from '../kit';

export type WorkSource = 'saved' | 'work' | 'expenses';

const SOURCES: { key: WorkSource; label: string }[] = [
  { key: 'saved', label: 'Saved items' },
  { key: 'work', label: 'Tasks & time' },
  { key: 'expenses', label: 'Expenses' },
];

interface Props {
  open: boolean;
  initial: WorkSource;
  clientId: string;
  money: (value: number) => string;
  onClose: () => void;
  onPick: (item: InvoiceItem) => void;
}

interface Row {
  id: string;
  title: string;
  detail?: string;
  amount: number;
  build: () => InvoiceItem;
}

export function WorkPicker({
  open,
  initial,
  clientId,
  money,
  onClose,
  onPick,
}: Props) {
  const t = useTheme();

  const [source, setSource] = useState<WorkSource>(initial);
  const [query, setQuery] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setSource(initial);
      setQuery('');
    }
  }, [open, initial]);

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
    <Sheet
      open={open}
      onClose={onClose}
      title="Add to this invoice"
      width="34rem"
    >
      <div
        className="inline-flex p-0.5 mb-4"
        style={{
          backgroundColor: t.dark ? t.colors.$25 : t.colors.$15,
          borderRadius: radius.control,
        }}
      >
        {SOURCES.map((entry) => (
          <button
            key={entry.key}
            type="button"
            onClick={() => setSource(entry.key)}
            className="text-xs px-3 py-1.5"
            style={{
              borderRadius: '0.375rem',
              fontWeight: 500,
              color: source === entry.key ? t.text : t.muted,
              backgroundColor: source === entry.key ? t.surface : 'transparent',
              boxShadow:
                source === entry.key ? '0 1px 2px rgba(9,9,11,0.10)' : 'none',
            }}
          >
            {entry.label}
          </button>
        ))}
      </div>

      {source === 'saved' ? (
        <TextField
          placeholder="Search saved items"
          value={query}
          autoFocus
          onChange={(event) => setQuery(event.target.value)}
          className="mb-3"
        />
      ) : null}

      {loading ? (
        <div className="flex items-center gap-2 py-8 justify-center">
          <Spinner tone={t.muted} />
          <span className="text-sm" style={{ color: t.muted }}>
            Loading
          </span>
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm py-8 text-center" style={{ color: t.muted }}>
          {emptyCopy(source, Boolean(clientId))}
        </p>
      ) : (
        <div
          className="border overflow-hidden"
          style={{ borderColor: t.line, borderRadius: radius.control }}
        >
          {rows.map((row, index) => (
            <button
              key={row.id}
              type="button"
              onClick={() => {
                onPick(row.build());
                onClose();
              }}
              className="w-full text-left px-3.5 py-3 flex items-start justify-between gap-4"
              style={{
                borderTop: index === 0 ? 'none' : `1px solid ${t.hairline}`,
              }}
              onMouseEnter={(event) =>
                (event.currentTarget.style.backgroundColor = t.hover)
              }
              onMouseLeave={(event) =>
                (event.currentTarget.style.backgroundColor = 'transparent')
              }
            >
              <span className="min-w-0">
                <span className="block text-sm" style={{ color: t.text }}>
                  {row.title}
                </span>
                {row.detail ? (
                  <span
                    className="block text-xs mt-0.5"
                    style={{ color: t.muted }}
                  >
                    {row.detail}
                  </span>
                ) : null}
              </span>

              <span
                className="text-sm shrink-0"
                style={{ color: t.text, fontVariantNumeric: 'tabular-nums' }}
              >
                {money(row.amount)}
              </span>
            </button>
          ))}
        </div>
      )}
    </Sheet>
  );
}

async function load(
  source: WorkSource,
  query: string,
  clientId: string
): Promise<Row[]> {
  if (source === 'saved') {
    const response = await request(
      'GET',
      endpoint(
        '/api/v1/products?status=active&per_page=8&sort=product_key|asc&filter=:filter',
        { filter: encodeURIComponent(query.trim()) }
      ),
      {},
      { skipIntercept: true }
    );

    return (response.data.data as Product[]).map((product) => ({
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
    }));
  }

  if (!clientId) {
    return [];
  }

  if (source === 'work') {
    const response = await request(
      'GET',
      endpoint('/api/v1/tasks?status=active&per_page=50&client_id=:id', {
        id: clientId,
      }),
      {},
      { skipIntercept: true }
    );

    return (response.data.data as Task[])
      .filter((task) => !task.invoice_id)
      .map((task) => {
        const hours = calculateTaskHours(task.time_log);

        return {
          id: task.id,
          title: task.description || `Task ${task.number}`,
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
  }

  const response = await request(
    'GET',
    endpoint('/api/v1/expenses?status=active&per_page=50&client_id=:id', {
      id: clientId,
    }),
    {},
    { skipIntercept: true }
  );

  return (response.data.data as Expense[])
    .filter((expense) => !expense.invoice_id && expense.should_be_invoiced)
    .map((expense) => {
      const cost =
        expense.foreign_amount > 0 ? expense.foreign_amount : expense.amount;

      return {
        id: expense.id,
        title: expense.public_notes || `Expense ${expense.number}`,
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
          tax_rate1: taxRateOf(expense, expense.tax_amount1, expense.tax_rate1),
          tax_name2: expense.tax_name2,
          tax_rate2: taxRateOf(expense, expense.tax_amount2, expense.tax_rate2),
          tax_name3: expense.tax_name3,
          tax_rate3: taxRateOf(expense, expense.tax_amount3, expense.tax_rate3),
        }),
      };
    });
}

function taxRateOf(expense: Expense, amount: number, fallback: number): number {
  if (!expense.calculate_tax_by_amount) {
    return fallback;
  }

  if (expense.uses_inclusive_taxes) {
    return Math.round(((amount / expense.amount) * 100 * 1000) / 10) / 100;
  }

  return Math.round(((amount / expense.amount) * 1000) / 10) / 1;
}

function emptyCopy(source: WorkSource, hasClient: boolean): string {
  if (source === 'saved') {
    return 'No saved items yet. Anything you type on the invoice can be saved later.';
  }

  if (!hasClient) {
    return 'Choose who you are invoicing first.';
  }

  return source === 'work'
    ? 'No unbilled tasks or time for this customer.'
    : 'No unbilled expenses for this customer.';
}
