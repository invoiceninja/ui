/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export const invoiceMap: Record<string, string>[] = [
    { trans: 'invoice_number', value: "invoice.number" },
    { trans: 'user', value: "invoice.user_id" },
    { trans: 'amount', value: "invoice.amount" },
    { trans: 'balance', value: "invoice.balance" },
    { trans: 'client', value: "client.name" },
    { trans: 'discount', value: "item.discount" },
    { trans: 'po_number', value: "invoice.po_number" },
    { trans: 'date', value: "invoice.date" },
    { trans: 'due_date', value: "invoice.due_date" },
    { trans: 'terms', value: "invoice.terms" },
    { trans: 'status', value: "invoice.status" },
    { trans: 'public_notes', value: "invoice.public_notes" },
    { trans: 'sent', value: "invoice.is_sent" },
    { trans: 'private_notes', value: "invoice.private_notes" },
    { trans: 'uses_inclusive_taxes', value: "invoice.uses_inclusive_taxes" },
    { trans: 'tax_name', value: "item.tax_name3" },
    { trans: 'tax_rate', value: "item.tax_rate3" },
    { trans: 'is_amount_discount', value: "item.is_amount_discount" },
    { trans: 'footer', value: "invoice.footer" },
    { trans: 'partial', value: "invoice.partial" },
    { trans: 'partial_due_date', value: "invoice.partial_due_date" },
    { trans: 'custom_value1', value: "invoice.custom_value1" },
    { trans: 'custom_value2', value: "invoice.custom_value2" },
    { trans: 'custom_value3', value: "invoice.custom_value3" },
    { trans: 'custom_value4', value: "invoice.custom_value4" },
    { trans: 'surcharge', value: "invoice.custom_surcharge4" },
    { trans: 'exchange_rate', value: "invoice.exchange_rate" },
    { trans: 'payment_date', value: "payment.date" },
    { trans: 'payment_amount', value: "payment.amount" },
    { trans: 'transaction_reference', value: "payment.transaction_reference" },
    { trans: 'quantity', value: "item.quantity" },
    { trans: 'cost', value: "item.cost" },
    { trans: 'product_key', value: "item.product_key" },
    { trans: 'notes', value: "item.notes" },
    { trans: 'custom_value', value: "item.custom_value4" },
    { trans: 'type', value: "item.type_id" },
    { trans: 'email', value: "client.email" },
];