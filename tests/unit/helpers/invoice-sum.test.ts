import { InvoiceSum } from './../../../src/common/helpers/invoices/invoice-sum';
import invoice from '../../helpers/data/invoice';

describe('InvoiceSum test', () => {
  test('correct instance', () => {
    expect(new InvoiceSum(invoice)).toBeInstanceOf(InvoiceSum);
  });

  it('playground', async () => {
    await new InvoiceSum(invoice).build();
  });
});

describe('InvoiceSum test invoice calculation', () => {

  it('playground', async () => {

    invoice.line_items = [];
    const invoiceSum = await new InvoiceSum(invoice).build();

    expect(invoiceSum.invoice.amount).toEqual(0);
    expect(invoiceSum.invoice.balance).toEqual(0);

  });

});
