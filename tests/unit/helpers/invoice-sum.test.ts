import { InvoiceSum } from './../../../src/common/helpers/invoices/invoice-sum';
import invoice from '../../helpers/data/invoice';
import invoice_item from '../../helpers/data/invoice_item';
import { InvoiceItemSum } from '../../../src/common/helpers/invoices/invoice-item-sum';
import { InvoiceItem, InvoiceItemType } from '../../../src/common/interfaces/invoice-item';
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
    const invoiceItems = new InvoiceItemSum(invoice, USD);
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


  it('Line Item Tax Rates Higher Precision Costs', () => {

    invoice.is_amount_discount = false;
    invoice.discount = 0;
    invoice.custom_surcharge1 = 0;
    invoice.tax_rate1 = 0;
    invoice.tax_name1 = '';
    invoice.tax_rate2 = 0;
    invoice.tax_name2 = '';
    invoice.uses_inclusive_taxes = false;

    invoice.line_items = [{
      quantity: 1,
      cost: 82.6446,
      product_key: '',
      notes: '',
      discount: 0,
      is_amount_discount: false,
      tax_name1: 'VAT',
      tax_rate1: 21,
      tax_name2: '',
      tax_rate2: 0,
      tax_name3: '',
      tax_rate3: 0,
      sort_id: 0,
      line_total: 82.6446,
      gross_line_total: 82.6446,
      custom_value1: '',
      custom_value2: '',
      custom_value3: '',
      custom_value4: '',
      type_id: InvoiceItemType.Product,
      task_id: '',
      expense_id: '',
      product_cost: 0,
      date: '',
      tax_id: '1',

    }];


    const invoiceSum = new InvoiceSum(invoice, USD).build();

    expect(invoiceSum.subTotal).toEqual(82.64);
    expect(invoiceSum.totalTaxes).toEqual(17.36);
    expect(invoiceSum.invoice.amount).toEqual(100);
    expect(invoiceSum.invoice.balance).toEqual(100);
  });

  it('Line Items with Higher Precision Costs', () => {

    invoice.is_amount_discount = false;
    invoice.discount = 0;
    invoice.custom_surcharge1 = 0;
    invoice.tax_rate1 = 0;
    invoice.tax_name1 = '';
    invoice.tax_rate2 = 0;
    invoice.tax_name2 = '';
    invoice.uses_inclusive_taxes = false;

    invoice.line_items = [{
      quantity: 25,
      cost: 0.333,
      product_key: '',
      notes: '',
      discount: 0,
      is_amount_discount: false,
      tax_name1: '',
      tax_rate1: 0,
      tax_name2: '',
      tax_rate2: 0,
      tax_name3: '',
      tax_rate3: 0,
      sort_id: 0,
      line_total: 8.33,
      gross_line_total: 8.33,
      custom_value1: '',
      custom_value2: '',
      custom_value3: '',
      custom_value4: '',
      type_id: InvoiceItemType.Product,
      task_id: '',
      expense_id: '',
      product_cost: 0,
      date: '',
      tax_id: '1',
    }, {
        quantity: 25,
        cost: 0.333,
        product_key: '',
        notes: '',
        discount: 0,
        is_amount_discount: false,
        tax_name1: '',
        tax_rate1: 0,
        tax_name2: '',
        tax_rate2: 0,
        tax_name3: '',
        tax_rate3: 0,
        sort_id: 0,
        line_total: 8.33,
        gross_line_total: 8.33,
        custom_value1: '',
        custom_value2: '',
        custom_value3: '',
        custom_value4: '',
        type_id: InvoiceItemType.Product,
        task_id: '',
        expense_id: '',
        product_cost: 0,
        date: '',
        tax_id: '1',
      }, {
        quantity: 25,
        cost: 1.333,
        product_key: '',
        notes: '',
        discount: 0,
        is_amount_discount: false,
        tax_name1: '',
        tax_rate1: 0,
        tax_name2: '',
        tax_rate2: 0,
        tax_name3: '',
        tax_rate3: 0,
        sort_id: 0,
        line_total: 33.33,
        gross_line_total: 33.33,
        custom_value1: '',
        custom_value2: '',
        custom_value3: '',
        custom_value4: '',
        type_id: InvoiceItemType.Product,
        task_id: '',
        expense_id: '',
        product_cost: 0,
        date: '',
        tax_id: '1',
      }, {
        quantity: 25,
        cost: 0.267,
        product_key: '',
        notes: '',
        discount: 0,
        is_amount_discount: false,
        tax_name1: '',
        tax_rate1: 0,
        tax_name2: '',
        tax_rate2: 0,
        tax_name3: '',
        tax_rate3: 0,
        sort_id: 0,
        line_total: 6.68,
        gross_line_total: 6.68,
        custom_value1: '',
        custom_value2: '',
        custom_value3: '',
        custom_value4: '',
        type_id: InvoiceItemType.Product,
        task_id: '',
        expense_id: '',
        product_cost: 0,
        date: '',
        tax_id: '1',
      }, {
        quantity: 25,
        cost: 0.05,
        product_key: '',
        notes: '',
        discount: 0,
        is_amount_discount: false,
        tax_name1: '',
        tax_rate1: 0,
        tax_name2: '',
        tax_rate2: 0,
        tax_name3: '',
        tax_rate3: 0,
        sort_id: 0,
        line_total: 1.25,
        gross_line_total: 1.25,
        custom_value1: '',
        custom_value2: '',
        custom_value3: '',
        custom_value4: '',
        type_id: InvoiceItemType.Product,
        task_id: '',
        expense_id: '',
        product_cost: 0,
        date: '',
        tax_id: '1',
      },

  ];

  var x = (25 * 1.333).toFixed(3);

  expect(x).toEqual("33.325");
  expect(parseFloat(x)).toEqual(33.325);
  expect(parseFloat(x).toFixed(2)).toEqual("33.33");

  const invoiceSum = new InvoiceSum(invoice, USD).build();

  expect(invoiceSum.invoice.amount).toEqual(57.92);
  expect(invoiceSum.invoice.balance).toEqual(57.92);
  expect(invoiceSum.subTotal).toEqual(57.92);

  });

});
