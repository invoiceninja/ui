import { Invoice } from 'common/interfaces/invoice';

export class InvoiceItemSum {
  protected taxCollection = new Map();
  protected lineItems = new Map();
  protected currency = 'USD';

  constructor(protected invoice: Invoice) {}

  public process(): void {
    if (!this.invoice?.line_items || this.invoice?.line_items.length === 0) {
      return;
    }

    this.calcLineItems();
  }

  protected calcLineItems(): InvoiceItemSum {
    this.invoice.line_items.map((item) => {
      console.log(item.product_key);
    });

    return this;
  }
}
