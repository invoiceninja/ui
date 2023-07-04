/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

interface Record {
    trans: string;
    value: string;
}

export const paymentMap: Record[] = [
    { trans: 'number', value: "payment.number" },
    { trans: 'user', value: "payment.user_id" },
    { trans: 'amount', value: "payment.amount" },
    { trans: 'refunded', value: "payment.refunded" },
    { trans: 'applied', value: "payment.applied" },
    { trans: 'transaction_reference', value: "payment.transaction_reference" },
    { trans: 'private_notes', value: "payment.private_notes" },
    { trans: 'custom_value', value: "payment.custom_value4" },
    { trans: 'client', value: "payment.client_id" },
    { trans: 'invoice_number', value: "payment.invoice_number" },
    { trans: 'date', value: "payment.date" },
    { trans: 'method', value: "payment.method" },
];