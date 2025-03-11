/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Expense } from '$app/common/interfaces/expense';
import { useBlankInvoiceQuery } from '$app/common/queries/invoices';
import { invoiceAtom } from '$app/pages/invoices/common/atoms';
import { useSetAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { route } from '$app/common/helpers/route';
import { Invoice } from '$app/common/interfaces/invoice';
import { blankLineItem } from '$app/common/constants/blank-line-item';
import { InvoiceItemType } from '$app/common/interfaces/invoice-item';

interface Params {
  onlyAddToInvoice?: boolean;
}
export function useInvoiceExpense(params?: Params) {
  const navigate = useNavigate();

  const { data } = useBlankInvoiceQuery();

  const setInvoice = useSetAtom(invoiceAtom);

  const { onlyAddToInvoice } = params || {};

  const calculatedTaxRate = (
    expense: Expense,
    amount: number,
    default_rate: number
  ) => {
    if (expense.calculate_tax_by_amount) {
      if (expense.uses_inclusive_taxes) {
        return Math.round(((amount / expense.amount) * 100 * 1000) / 10) / 100;
      }

      return Math.round(((amount / expense.amount) * 1000) / 10) / 1;
    }

    return default_rate;
  };

  const create = (expenses: Expense[]) => {
    if (data) {
      const invoice: Invoice = { ...data };

      if (!onlyAddToInvoice) {
        invoice.date = expenses[0]?.date;
        invoice.client_id = expenses[0]?.client_id;
      }

      invoice.uses_inclusive_taxes = expenses[0]?.uses_inclusive_taxes;
      invoice.project_id = expenses[0]?.project_id;
      invoice.vendor_id = expenses[0]?.vendor_id;

      const lineItems = expenses.map((expense) => ({
        ...blankLineItem(),
        type_id: InvoiceItemType.Product,
        cost:
          expense?.foreign_amount > 0 ? expense.foreign_amount : expense.amount,
        quantity: 1,
        product_key: expense?.category?.name ?? '',
        notes: expense.public_notes,
        line_total: Number(
          (expense?.foreign_amount > 0
            ? expense.foreign_amount
            : expense.amount * 1
          ).toPrecision(2)
        ),
        expense_id: expense.id,
        tax_name1: expense.tax_name1,
        tax_rate1: calculatedTaxRate(
          expense,
          expense.tax_amount1,
          expense.tax_rate1
        ),
        tax_name2: expense.tax_name2,
        tax_rate2: calculatedTaxRate(
          expense,
          expense.tax_amount2,
          expense.tax_rate2
        ),
        tax_name3: expense.tax_name3,
        tax_rate3: calculatedTaxRate(
          expense,
          expense.tax_amount3,
          expense.tax_rate3
        ),
        custom_value1: expense.custom_value1,
        custom_value2: expense.custom_value2,
        custom_value3: expense.custom_value3,
        custom_value4: expense.custom_value4,
      }));

      if (!onlyAddToInvoice) {
        setInvoice({ ...invoice, line_items: lineItems });

        navigate(
          route('/invoices/create?table=products&action=invoice_expense', {})
        );
      } else {
        setInvoice(
          (current) =>
            current && {
              ...current,
              line_items: [...current.line_items, ...lineItems],
            }
        );
      }
    }
  };

  return {
    create,
    calculatedTaxRate,
  };
}
