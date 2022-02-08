import { Invoice } from 'common/interfaces/invoice';
import { InvoiceItemSum } from './invoice-item-sum';

export class InvoiceSum {
  protected taxMap = new Map();
  protected invoiceItems: InvoiceItemSum = new InvoiceItemSum(this.invoice);

  constructor(protected invoice: Invoice) {}

  public build(): InvoiceSum {
    this.calculateLineItems();

    return this;
  }

  private calculateLineItems(): InvoiceSum {
    this.invoiceItems.process();

    return this;
  }
}
