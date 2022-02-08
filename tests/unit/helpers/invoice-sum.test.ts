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
