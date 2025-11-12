/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useNavigate } from 'react-router-dom';
import { Invoice } from '$app/common/interfaces/invoice';
import dayjs from 'dayjs';
import { useSetAtom } from 'jotai';
import { invoiceAtom } from '../../common/atoms';

export function useCloneToNegativeInvoice() {
  const navigate = useNavigate();
  const setInvoice = useSetAtom(invoiceAtom);

  const cloneToNegativeInvoice = (invoice: Invoice, reason?: string) => {
    console.log('cloneToNegativeInvoice called with:', { invoice: invoice.id, reason });
    
    // Create a deep copy of the invoice with negative quantities for all line items
    const negativeInvoice = {
      ...invoice,
      id: '',
      number: '',
      documents: [],
      due_date: '',
      date: dayjs().format('YYYY-MM-DD'),
      total_taxes: 0,
      exchange_rate: 1,
      last_sent_date: '',
      project_id: '',
      subscription_id: '',
      status_id: '',
      vendor_id: '',
      paid_to_date: 0,
      partial: 0,
      partial_due_date: '',
      // Reverse monetary amounts for credit note
      amount: -Math.abs(invoice.amount),
      balance: -Math.abs(invoice.balance),
      // Iterate through all line items and set quantities to negative
      line_items: invoice.line_items.map(item => ({
        ...item,
        quantity: -Math.abs(item.quantity),
        // Recalculate line totals for negative quantities
        line_total: -Math.abs(item.line_total),
        gross_line_total: -Math.abs(item.gross_line_total),
      })),
      modified_invoice_id: invoice.id,
      // Include the reason if provided
      ...(reason && { reason: reason }),
    };

    console.log('Created negative invoice:', negativeInvoice);

    setInvoice(negativeInvoice);
    console.log('Set invoice in atom, navigating to create page');

    navigate('/invoices/create?action=clone');
  };

  return cloneToNegativeInvoice;
}
