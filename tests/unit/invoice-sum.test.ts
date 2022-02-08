import { InvoiceSum } from '../../src/common/helpers/invoices/invoice-sum';
import invoice from '../helpers/data/invoice';

describe('InvoiceSum test', () => {
  it('should be an instance of InvoiceSum class', () => {
    const invoiceSum = new InvoiceSum(invoice);

    expect(invoiceSum).toBeInstanceOf(InvoiceSum);
  });
});
