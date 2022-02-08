import { InvoiceItemSum } from './invoice-item-sum';
import { Invoice } from 'common/interfaces/invoice';

export class InvoiceSum {
  protected taxMap = new Map();
  protected invoiceItems = new InvoiceItemSum(this.invoice);

  constructor(protected invoice: Invoice) {}

  public async build() {
    await this.calculateLineItems();

    return this;
  }

  protected async calculateLineItems() {
    await this.invoiceItems.process();

    return this;
  }
}
