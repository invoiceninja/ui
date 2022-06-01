/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export interface Expense {
    id: string;
    amount: number;
    assigned_user_id: string;
    user_id: string;
    archived_at: number;
    is_deleted: boolean;
    created_at: number;
    updated_at: number;
    calculate_tax_by_amount: boolean;
    category_id: string;
    client_id: string;
    currency_id: string;
    custom_value1: string;
    custom_value2: string;
    custom_value3: string;
    custom_value4: string;
    date: string;
    exchange_rate: number;
    foreign_amount: number;
    invoice_currency_id: string;
    invoice_documents: boolean;
    invoice_id: string;
    number: string;
    payment_date: string;
    payment_type_id: string;
    private_notes: string;
    recurring_expense_id: string;
    should_be_invoiced: boolean;
    tax_amount1: number;
    tax_amount2: number;
    tax_amount3: number;
    tax_rate1: number;
    tax_rate2: number;
    tax_rate3: number;
    tax_name1: string;
    tax_name2: string;
    tax_name3: string;
    transaction_id: string;
    transaction_reference: string;
    uses_inclusive_taxes:boolean;
    vendor_id: string;
    
}
