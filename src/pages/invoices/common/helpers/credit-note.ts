/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import dayjs from 'dayjs';
import { Credit } from '$app/common/interfaces/credit';
import { Invoice } from '$app/common/interfaces/invoice';

export function buildPeppolCreditNote(
  invoice: Invoice,
  creditDesignId: string | undefined,
  date = dayjs().format('YYYY-MM-DD')
) {
  return {
    ...(invoice as unknown as Credit),
    id: '',
    number: '',
    documents: [],
    date,
    due_date: '',
    partial_due_date: '',
    total_taxes: 0,
    exchange_rate: 1,
    last_sent_date: '',
    project_id: '',
    subscription_id: '',
    status_id: '',
    vendor_id: '',
    paid_to_date: 0,
    design_id: creditDesignId,
    client: undefined,
    // The API treats a populated invoice_id as an invoice reversal command.
    invoice_id: '',
    e_invoice: {
      CreditNote: {
        BillingReference: [
          {
            InvoiceDocumentReference: {
              ID: invoice.number,
              IssueDate: invoice.date,
            },
          },
        ],
      },
    },
  } as unknown as Credit;
}

export function buildClonedCredit(
  invoice: Invoice,
  creditDesignId: string | undefined,
  date = dayjs().format('YYYY-MM-DD')
) {
  return {
    ...(invoice as unknown as Credit),
    id: '',
    number: '',
    documents: [],
    date,
    due_date: '',
    partial_due_date: '',
    total_taxes: 0,
    exchange_rate: 1,
    last_sent_date: '',
    project_id: '',
    subscription_id: '',
    status_id: '',
    vendor_id: '',
    paid_to_date: 0,
    design_id: creditDesignId,
    client: undefined,
    invoice_id: '',
    e_invoice: null,
  } as unknown as Credit;
}

export function buildCreditFromInvoice(
  invoice: Invoice,
  creditDesignId: string | undefined,
  isPeppol: boolean,
  date = dayjs().format('YYYY-MM-DD')
) {
  return isPeppol
    ? buildPeppolCreditNote(invoice, creditDesignId, date)
    : buildClonedCredit(invoice, creditDesignId, date);
}
