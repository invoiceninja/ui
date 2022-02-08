import { InvoiceSum } from './../../../src/common/helpers/invoices/invoice-sum';
import invoice from '../../helpers/data/invoice';

describe('InvoiceSum test', () => {
  it('should be correct instance', () =>
    expect(new InvoiceSum(invoice)).toBeInstanceOf(InvoiceSum));
});
