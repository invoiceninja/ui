/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Invoice } from '$app/common/interfaces/invoice';
import { Payment, Paymentable } from '$app/common/interfaces/payment';

export interface InvoicePaymentAllocationRow {
  paymentable: Paymentable;
  payment: Payment;
}

function isActiveInvoicePaymentable(
  invoice: Invoice,
  paymentable: Paymentable,
  allowMissingInvoiceId = false
) {
  return (
    paymentable.archived_at === 0 &&
    (paymentable.invoice_id === invoice.id ||
      (allowMissingInvoiceId && !paymentable.invoice_id))
  );
}

function buildPaymentByPaymentableIdMap(payments: Payment[]) {
  return new Map(
    payments.flatMap((payment) =>
      (payment.paymentables ?? []).map(
        (paymentable) => [paymentable.id, payment] as const
      )
    )
  );
}

export function getInvoicePaymentAllocationRows(
  invoice: Invoice | undefined
): InvoicePaymentAllocationRow[] {
  if (!invoice) {
    return [];
  }

  const payments = invoice.payments ?? [];
  const nestedPaymentableRows = payments.flatMap((payment) =>
    (payment.paymentables ?? [])
      .filter((paymentable) => isActiveInvoicePaymentable(invoice, paymentable))
      .map((paymentable) => ({
        paymentable,
        payment,
      }))
  );

  if (!invoice.paymentables?.length) {
    return nestedPaymentableRows;
  }

  const paymentsById = new Map(
    payments.map((payment) => [payment.id, payment] as const)
  );
  const paymentsByPaymentableId = buildPaymentByPaymentableIdMap(payments);

  const topLevelPaymentableRows = invoice.paymentables.flatMap(
    (paymentable): InvoicePaymentAllocationRow[] => {
      if (!isActiveInvoicePaymentable(invoice, paymentable, true)) {
        return [];
      }

      const payment = paymentable.payment_id
        ? paymentsById.get(paymentable.payment_id)
        : paymentsByPaymentableId.get(paymentable.id);

      return payment ? [{ paymentable, payment }] : [];
    }
  );

  if (!topLevelPaymentableRows.length) {
    return nestedPaymentableRows;
  }

  const topLevelPaymentableIds = new Set(
    topLevelPaymentableRows.map(({ paymentable }) => paymentable.id)
  );

  return [
    ...topLevelPaymentableRows,
    ...nestedPaymentableRows.filter(
      ({ paymentable }) => !topLevelPaymentableIds.has(paymentable.id)
    ),
  ];
}
