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
    { trans: 'project', value: 'project_id' },
    { trans: 'vendor', value: 'vendor_id' },
    { trans: 'custom_value1', value: 'custom_value1' },
    { trans: 'custom_value2', value: 'custom_value2' },
    { trans: 'custom_value3', value: 'custom_value3' },
    { trans: 'custom_value4', value: 'custom_value4' },
    { trans: 'product_key', value: 'product_key' },
    { trans: 'notes', value: 'notes' },
    { trans: 'cost', value: 'cost' },
    { trans: 'price', value: 'price' },
    { trans: 'quantity', value: 'quantity' },
    { trans: 'tax_rate1', value: 'tax_rate1' },
    { trans: 'tax_rate2', value: 'tax_rate2' },
    { trans: 'tax_rate3', value: 'tax_rate3' },
    { trans: 'tax_name1', value: 'tax_name1' },
    { trans: 'tax_name2', value: 'tax_name2' },
    { trans: 'tax_name3', value: 'tax_name3' },
];