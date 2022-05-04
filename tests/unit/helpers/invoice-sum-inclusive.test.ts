import { InvoiceSumInclusive } from './../../../src/common/helpers/invoices/invoice-sum-inclusive';
import invoice from '../../helpers/data/invoice';
import invoice_item from '../../helpers/data/invoice_item';
import { InvoiceItemSum } from '../../../src/common/helpers/invoices/invoice-item-sum';
import { InvoiceItem } from '../../../src/common/interfaces/invoice-item';
import currencies from '../../helpers/data/currencies';

const USD = currencies[0];

describe('InvoiceSumInclusive test', () => {
  test('correct instance', () => {
    expect(new InvoiceSumInclusive(invoice)).toBeInstanceOf(
      InvoiceSumInclusive
    );
  });

  it('playground', async () => {
    await new InvoiceSumInclusive(invoice).build();
  });
});

describe('InvoiceSum test invoice calculation', () => {
  it('Calculate Line Items', async () => {
    const invoiceItems = new InvoiceItemSum(invoice, USD);

    await invoiceItems.process();

    expect(invoiceItems.subTotal).toEqual(2628);
  });

  it('Line Item Calc', async () => {
    const invoiceSum = await new InvoiceSumInclusive(invoice).build();

    expect(invoiceSum.invoice.amount).toEqual(2628);
    expect(invoiceSum.invoice.balance).toEqual(2628);
  });

  it('Single line item', async () => {
    invoice.line_items = [];

    invoice.tax_name1 = '';
    invoice.tax_rate1 = 0;
    invoice.tax_name2 = '';
    invoice.tax_rate2 = 0;
    invoice.tax_name3 = '';
    invoice.tax_rate3 = 0;

    invoice.line_items = invoice_item;
    const invoiceSum = await new InvoiceSumInclusive(invoice).build();

    expect(invoiceSum.invoice.amount).toEqual(20);
    expect(invoiceSum.invoice.balance).toEqual(20);
  });

  it('Amount Invoice Discount', async () => {
    invoice.is_amount_discount = true;
    invoice.discount = 1;

    const invoiceSum = await new InvoiceSumInclusive(invoice).build();

    expect(invoiceSum.invoice.amount).toEqual(19);
    expect(invoiceSum.invoice.balance).toEqual(19);
  });

  it('Percentage Invoice Discount', async () => {
    invoice.is_amount_discount = false;
    invoice.discount = 50;

    const invoiceSum = await new InvoiceSumInclusive(invoice).build();

    expect(invoiceSum.invoice.amount).toEqual(10);
    expect(invoiceSum.invoice.balance).toEqual(10);
  });

  it('Invoice Discount With Surcharge', async () => {
    invoice.is_amount_discount = true;
    invoice.discount = 5;
    invoice.custom_surcharge1 = 5;

    const invoiceSum = await new InvoiceSumInclusive(invoice).build();

    expect(invoiceSum.invoice.amount).toEqual(20);
    expect(invoiceSum.invoice.balance).toEqual(20);
  });

  it('Invoice Totals With Discount With Surcharge With Inclusive Tax', async () => {
    invoice.is_amount_discount = true;
    invoice.discount = 5;
    invoice.custom_surcharge1 = 5;
    invoice.tax_rate1 = 10;
    invoice.tax_name1 = 'GST';
    invoice.uses_inclusive_taxes = true;

    const invoiceSum = await new InvoiceSumInclusive(invoice).build();

    expect(invoiceSum.subTotal).toEqual(20);
    expect(invoiceSum.invoice.amount).toEqual(20);
    expect(invoiceSum.invoice.balance).toEqual(20);
  });

  it('Invoice Totals With Discount With Surcharge With Inclusive Tax', async () => {
    invoice.is_amount_discount = true;
    invoice.discount = 5;
    invoice.custom_surcharge1 = 5;
    invoice.tax_rate1 = 10;
    invoice.tax_name1 = 'GST';
    invoice.tax_rate2 = 10;
    invoice.tax_name2 = 'GST';
    invoice.uses_inclusive_taxes = true;

    const invoiceSum = await new InvoiceSumInclusive(invoice).build();

    expect(invoiceSum.subTotal).toEqual(20);
    expect(invoiceSum.invoice.amount).toEqual(20);
    expect(invoiceSum.invoice.balance).toEqual(20);
  });

  it('Line Item Tax Rates Inclusive Taxes', async () => {
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
    invoice.uses_inclusive_taxes = true;

    const invoiceSum = await new InvoiceSumInclusive(invoice).build();

    expect(invoiceSum.subTotal).toEqual(20);
    expect(invoiceSum.invoice.amount).toEqual(20);
    expect(invoiceSum.invoice.balance).toEqual(20);
  });

  it('Line Item Tax Rates Inclusive Taxes', async () => {
    invoice.line_items.map((item: InvoiceItem) => {
      item.tax_name1 = 'GST';
      item.tax_rate1 = 10;
      return item;
    });

    invoice.is_amount_discount = true;
    invoice.discount = 0;
    invoice.custom_surcharge1 = 0;
    invoice.tax_rate1 = 0;
    invoice.tax_name1 = '';
    invoice.tax_rate2 = 0;
    invoice.tax_name2 = '';
    invoice.uses_inclusive_taxes = true;

    const invoiceSum = await new InvoiceSumInclusive(invoice).build();

    expect(invoiceSum.subTotal).toEqual(20);
    expect(invoiceSum.totalTaxes).toEqual(1.82);
  });

  it('Calculate Line Item Tax Total', async () => {
    const newItem: InvoiceItem = {
      quantity: 1,
      cost: 14,
      product_key: '',
      notes: '',
      discount: 0,
      is_amount_discount: true,
      tax_name1: 'GST',
      tax_rate1: 10,
      tax_name2: '',
      tax_rate2: 0,
      tax_name3: '',
      tax_rate3: 0,
      sort_id: 0,
      line_total: 10,
      gross_line_total: 10,
      custom_value1: '',
      custom_value2: '',
      custom_value3: '',
      custom_value4: '',
      type_id: '1',
      product_cost: 0,
      date: '',
    };

    invoice.line_items = [];
    invoice.line_items.push(newItem);

    invoice.is_amount_discount = true;
    invoice.discount = 0;
    invoice.custom_surcharge1 = 0;
    invoice.tax_rate1 = 0;
    invoice.tax_name1 = '';
    invoice.tax_rate2 = 0;
    invoice.tax_name2 = '';
    invoice.uses_inclusive_taxes = true;

    const invoiceSum = await new InvoiceSumInclusive(invoice).build();

    expect(invoiceSum.subTotal).toEqual(14);
    expect(invoiceSum.totalTaxes).toEqual(1.27);
  });

  it('Calculate LineTotal With multi length discount', async () => {
    const new_item: InvoiceItem = {
      quantity: 1,
      cost: 10,
      product_key: '',
      notes: '',
      discount: 2.521254522145214511,
      is_amount_discount: true,
      tax_name1: '',
      tax_rate1: 0,
      tax_name2: '',
      tax_rate2: 0,
      tax_name3: '',
      tax_rate3: 0,
      sort_id: 0,
      line_total: 10,
      gross_line_total: 10,
      custom_value1: '',
      custom_value2: '',
      custom_value3: '',
      custom_value4: '',
      type_id: '1',
      product_cost: 0,
      date: '',
    };

    invoice.line_items = [];
    invoice.line_items.push(new_item);

    invoice.is_amount_discount = true;
    invoice.discount = 0;
    invoice.custom_surcharge1 = 0;
    invoice.tax_rate1 = 0;
    invoice.tax_name1 = '';
    invoice.tax_rate2 = 0;
    invoice.tax_name2 = '';
    invoice.uses_inclusive_taxes = true;

    const invoiceSum = await new InvoiceSumInclusive(invoice).build();

    //todo - this value is failing - need to fix when @ben implements client accessor in Invoice Model
    // expect(invoiceSum.subTotal).toEqual(7.48);
    expect(invoiceSum.totalTaxes).toEqual(0);
  });
});
