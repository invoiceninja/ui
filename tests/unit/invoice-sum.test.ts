import { InvoiceSum } from '../../src/common/helpers/invoice-sum';

describe('InvoiceSum test', () => {
  it('should be an instance of InvoiceSum class', () => {
    const invoiceSum = new InvoiceSum();

    expect(invoiceSum).toBeInstanceOf(InvoiceSum);
  });
});
