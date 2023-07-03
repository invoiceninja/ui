/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export const invoiceMap = {
    invoice_number: "invoice.number",
    user: "invoice.user_id",
    amount: "invoice.amount",
    balance: "invoice.balance",
    client: "client.name",
    discount: "item.discount",
    po_number: "invoice.po_number",
    date: "invoice.date",
    due_date: "invoice.due_date",
    terms: "invoice.terms",
    status: "invoice.status",
    public_notes: "invoice.public_notes",
    sent: "invoice.is_sent",
    private_notes: "invoice.private_notes",
    uses_inclusive_taxes: "invoice.uses_inclusive_taxes",
    tax_name: "item.tax_name3",
    tax_rate: "item.tax_rate3",
    is_amount_discount: "item.is_amount_discount",
    footer: "invoice.footer",
    partial: "invoice.partial",
    partial_due_date: "invoice.partial_due_date",
    custom_value1: "invoice.custom_value1",
    custom_value2: "invoice.custom_value2",
    custom_value3: "invoice.custom_value3",
    custom_value4: "invoice.custom_value4",
    surcharge: "invoice.custom_surcharge4",
    exchange_rate: "invoice.exchange_rate",
    payment_date: "payment.date",
    payment_amount: "payment.amount",
    transaction_reference: "payment.transaction_reference",
    quantity: "item.quantity",
    cost: "item.cost",
    product_key: "item.product_key",
    notes: "item.notes",
    custom_value: "item.custom_value4",
    type: "item.type_id",
    email: "client.email",
}