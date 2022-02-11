import { InvoiceSum } from './../../../src/common/helpers/invoices/invoice-sum';
import invoice from '../../helpers/data/invoice';
import invoice_item from '../../helpers/data/invoice_item';
import { InvoiceItem } from './../../../src/common/interfaces/invoice-item';
import { InvoiceItemSum } from '../../../src/common/helpers/invoices/invoice-item-sum';


describe('InvoiceSum test', () => {
  test('correct instance', () => {
    expect(new InvoiceSum(invoice)).toBeInstanceOf(InvoiceSum);
  });

  it('playground', async () => {
    await new InvoiceSum(invoice).build();
  });
});

describe('InvoiceSum test invoice calculation', () => {

  it('Calculate Line Items',async () => {
    
    const invoiceItems = await new InvoiceItemSum(invoice);
    invoiceItems.process();

    expect(invoiceItems.subTotal).toEqual(2628);

  });

  it('Line Item Calc', async () => {

    // invoice.line_items = invoice_item;

    const invoiceSum = await new InvoiceSum(invoice).build();

    expect(invoiceSum.invoice.amount).toEqual(3723);
    expect(invoiceSum.invoice.balance).toEqual(3723);

  });

  // it('Zero sum invoice', async () => {

  //   invoice.line_items = [];
  //   const invoiceSum = await new InvoiceSum(invoice).build();

  //   expect(invoiceSum.invoice.amount).toEqual(0);
  //   expect(invoiceSum.invoice.balance).toEqual(0);

  // });


});
