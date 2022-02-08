export class InvoiceSum {
  protected taxMap = new Map();
  protected invoiceItems = new Map();

  constructor(protected invoice: unknown) {} // Need to declare Invoice interface

  public build(): InvoiceSum {
    return this;
  }

  private calculateLineItems(): InvoiceSum {
    return this;
  }
}
