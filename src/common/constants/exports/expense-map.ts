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

export const expenseMap: Record[] = [
    { trans: 'invoice_number', value: "invoice.number" },
    { trans: 'amount' , value: 'amount' },
    { trans: 'category' , value: 'category_id' },
    { trans: 'client' , value: 'client_id' },
    { trans: 'custom_value1' , value: 'custom_value1' },
    { trans: 'custom_value2' , value: 'custom_value2' },
    { trans: 'custom_value3' , value: 'custom_value3' },
    { trans: 'custom_value4' , value: 'custom_value4' },
    { trans: 'currency' , value: 'currency_id' },
    { trans: 'date' , value: 'date' },
    { trans: 'exchange_rate' , value: 'exchange_rate' },
    { trans: 'converted_amount' , value: 'foreign_amount' },
    { trans: 'invoice_currency_id' , value: 'invoice_currency_id' },
    { trans: 'payment_date' , value: 'payment_date' },
    { trans: 'number' , value: 'number' },
    { trans: 'payment_type_id' , value: 'payment_type_id' },
    { trans: 'private_notes' , value: 'private_notes' },
    { trans: 'project' , value: 'project_id' },
    { trans: 'public_notes' , value: 'public_notes' },
    { trans: 'tax_amount1' , value: 'tax_amount1' },
    { trans: 'tax_amount2' , value: 'tax_amount2' },
    { trans: 'tax_amount3' , value: 'tax_amount3' },
    { trans: 'tax_name1' , value: 'tax_name1' },
    { trans: 'tax_name2' , value: 'tax_name2' },
    { trans: 'tax_name3' , value: 'tax_name3' },
    { trans: 'tax_rate1' , value: 'tax_rate1' },
    { trans: 'tax_rate2' , value: 'tax_rate2' },
    { trans: 'tax_rate3' , value: 'tax_rate3' },
    { trans: 'transaction_reference' , value: 'transaction_reference' },
    { trans: 'vendor' , value: 'vendor_id' },
    { trans: 'invoice' , value: 'invoice_id' },
];