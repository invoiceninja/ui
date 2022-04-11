import { InvoiceSum } from './../../../src/common/helpers/invoices/invoice-sum';
import invoice from '../../helpers/data/invoice';
import invoice_item from '../../helpers/data/invoice_item';
import { InvoiceItemSum } from '../../../src/common/helpers/invoices/invoice-item-sum';
import { InvoiceItem } from '../../../src/common/interfaces/invoice-item';
import currencies from '../../helpers/data/currencies';

const USD = currencies[0];

describe('InvoiceSum test', () => {
  test('correct instance', () => {
    expect(new InvoiceSum(invoice, USD)).toBeInstanceOf(InvoiceSum);
  });

  it('playground', () => {
    new InvoiceSum(invoice, USD).build();
  });
});

describe('InvoiceSum test invoice calculation', () => {
  it('Calculate Line Items', () => {
    const invoiceItems = new InvoiceItemSum(invoice);
    invoiceItems.process();

    expect(invoiceItems.subTotal).toEqual(2628);
  });

  it('Line Item Calc', () => {
    const invoiceSum = new InvoiceSum(invoice, USD).build();

    expect(invoiceSum.invoice.amount).toEqual(3723);
    expect(invoiceSum.invoice.balance).toEqual(3723);
  });

  it('Single line item', () => {
    invoice.line_items = [];

    invoice.tax_name1 = '';
    invoice.tax_rate1 = 0;
    invoice.tax_name2 = '';
    invoice.tax_rate2 = 0;
    invoice.tax_name3 = '';
    invoice.tax_rate3 = 0;

    invoice.line_items = invoice_item;
    const invoiceSum = new InvoiceSum(invoice, USD).build();

    expect(invoiceSum.invoice.amount).toEqual(20);
    expect(invoiceSum.invoice.balance).toEqual(20);
  });

  it('Amount Invoice Discount', () => {
    invoice.is_amount_discount = true;
    invoice.discount = 1;

    const invoiceSum = new InvoiceSum(invoice, USD).build();

    expect(invoiceSum.invoice.amount).toEqual(19);
    expect(invoiceSum.invoice.balance).toEqual(19);
  });

  it('Percentage Invoice Discount', () => {
    invoice.is_amount_discount = false;
    invoice.discount = 50;

    const invoiceSum = new InvoiceSum(invoice, USD).build();

    expect(invoiceSum.invoice.amount).toEqual(10);
    expect(invoiceSum.invoice.balance).toEqual(10);
  });

  it('Invoice Discount With Surcharge', () => {
    invoice.is_amount_discount = true;
    invoice.discount = 5;
    invoice.custom_surcharge1 = 5;

    const invoiceSum = new InvoiceSum(invoice, USD).build();

    expect(invoiceSum.invoice.amount).toEqual(20);
    expect(invoiceSum.invoice.balance).toEqual(20);
  });

  it('Invoice Totals With Discount With Surcharge With Exclusive Tax', () => {
    invoice.is_amount_discount = true;
    invoice.discount = 5;
    invoice.custom_surcharge1 = 5;
    invoice.tax_rate1 = 10;
    invoice.tax_name1 = 'GST';

    const invoiceSum = new InvoiceSum(invoice, USD).build();

    expect(invoiceSum.subTotal).toEqual(20);
    expect(invoiceSum.invoice.amount).toEqual(21.5);
    expect(invoiceSum.invoice.balance).toEqual(21.5);
  });

  it('Invoice Totals With Discount With Surcharge With Exclusive Tax', () => {
    invoice.is_amount_discount = true;
    invoice.discount = 5;
    invoice.custom_surcharge1 = 5;
    invoice.tax_rate1 = 10;
    invoice.tax_name1 = 'GST';
    invoice.tax_rate2 = 10;
    invoice.tax_name2 = 'GST';

    const invoiceSum = new InvoiceSum(invoice, USD).build();

    expect(invoiceSum.subTotal).toEqual(20);
    expect(invoiceSum.invoice.amount).toEqual(23);
    expect(invoiceSum.invoice.balance).toEqual(23);
  });

  it('Line Item Tax Rates Exclusive Taxes', () => {
    invoice.line_items.map((item: InvoiceItem) => {
      item.tax_name1 = 'GST';
      item.tax_rate1 = 10;
      return item;
    });

    invoice.is_amount_discount = true;
    invoice.discount = 0;
    invoice.custom_surcharge1 = 0;
    invoice.tax_rate1 = 10;
    invoice.tax_name1 = 'GST';
    invoice.tax_rate2 = 10;
    invoice.tax_name2 = 'GST';
    invoice.uses_inclusive_taxes = false;

    const invoiceSum = new InvoiceSum(invoice, USD).build();

    expect(invoiceSum.subTotal).toEqual(20);
    expect(invoiceSum.invoice.amount).toEqual(26);
    expect(invoiceSum.invoice.balance).toEqual(26);
  });
});
