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
import { useAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { route } from '$app/common/helpers/route';
import { Invoice } from '$app/common/interfaces/invoice';
import { blankLineItem } from '$app/common/constants/blank-line-item';
import {
  InvoiceItem,
  InvoiceItemType,
} from '$app/common/interfaces/invoice-item';

export function useInvoiceExpense() {
  const navigate = useNavigate();
  const { data } = useBlankInvoiceQuery();
  const [, setInvoice] = useAtom(invoiceAtom);

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

  const create = (expense: Expense) => {
    if (data) {
      const invoice: Invoice = { ...data };

      invoice.date = expense.date;
      invoice.client_id = expense.client_id;
      invoice.uses_inclusive_taxes = expense.uses_inclusive_taxes;
      invoice.project_id = expense.project_id;
      invoice.vendor_id = expense.vendor_id;

      const item: InvoiceItem = {
        ...blankLineItem(),
        type_id: InvoiceItemType.Product,
        cost: expense?.foreign_amount > 0 ? expense.foreign_amount : expense.amount,
        quantity: 1,
        product_key: expense?.category?.name ?? '',
        notes: expense.public_notes,
        line_total: Number((expense?.foreign_amount > 0 ? expense.foreign_amount : expense.amount * 1).toPrecision(2)),
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
      };

      invoice.line_items = [item];

      setInvoice(invoice);

      navigate(
        route('/invoices/create?table=products&action=invoice_expense', {})
      );
    }
  };

  return {
    create,
    calculatedTaxRate,
  };
}
