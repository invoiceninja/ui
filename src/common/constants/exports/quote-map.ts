/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export const quoteMap = {
quote_number: "quote.number",
user: "quote.user_id",
amount: "quote.amount",
balance: "quote.balance",
client: "client.name",
discount: "item.discount",
po_number: "quote.po_number",
date: "quote.date",
due_date: "quote.due_date",
terms: "quote.terms",
status: "quote.status",
public_notes: "quote.public_notes",
sent: "quote.is_sent",
private_notes: "quote.private_notes",
uses_inclusive_taxes: "quote.uses_inclusive_taxes",
tax_name: "item.tax_name3",
tax_rate: "item.tax_rate3",
is_amount_discount: "item.is_amount_discount",
footer: "quote.footer",
partial: "quote.partial",
partial_due_date: "quote.partial_due_date",
custom_value1: "quote.custom_value1",
custom_value2: "quote.custom_value2",
custom_value3: "quote.custom_value3",
custom_value4: "quote.custom_value4",
surcharge: "quote.custom_surcharge4",
exchange_rate: "quote.exchange_rate",
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
};