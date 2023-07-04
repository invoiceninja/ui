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

export const quoteMap: Record[] = [
{ trans: 'quote_number', value: "quote.number" },
{ trans: 'user', value: "quote.user_id" },
{ trans: 'amount', value: "quote.amount" },
{ trans: 'balance', value: "quote.balance" },
{ trans: 'client', value: "client.name" },
{ trans: 'discount', value: "item.discount" },
{ trans: 'po_number', value: "quote.po_number" },
{ trans: 'date', value: "quote.date" },
{ trans: 'due_date', value: "quote.due_date" },
{ trans: 'terms', value: "quote.terms" },
{ trans: 'status', value: "quote.status" },
{ trans: 'public_notes', value: "quote.public_notes" },
{ trans: 'sent', value: "quote.is_sent" },
{ trans: 'private_notes', value: "quote.private_notes" },
{ trans: 'uses_inclusive_taxes', value: "quote.uses_inclusive_taxes" },
{ trans: 'tax_name', value: "item.tax_name3" },
{ trans: 'tax_rate', value: "item.tax_rate3" },
{ trans: 'is_amount_discount', value: "item.is_amount_discount" },
{ trans: 'footer', value: "quote.footer" },
{ trans: 'partial', value: "quote.partial" },
{ trans: 'partial_due_date', value: "quote.partial_due_date" },
{ trans: 'custom_value1', value: "quote.custom_value1" },
{ trans: 'custom_value2', value: "quote.custom_value2" },
{ trans: 'custom_value3', value: "quote.custom_value3" },
{ trans: 'custom_value4', value: "quote.custom_value4" },
{ trans: 'surcharge', value: "quote.custom_surcharge4" },
{ trans: 'exchange_rate', value: "quote.exchange_rate" },
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