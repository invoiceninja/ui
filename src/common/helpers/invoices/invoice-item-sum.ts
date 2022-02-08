import { Invoice } from 'common/interfaces/invoice';
import { InvoiceItem } from 'common/interfaces/invoice-item';

export class InvoiceItemSum {
  protected taxCollection: Record<string, unknown>[] = [];
  protected currency = 'USD'; // Needs fixes, obviously.

  protected lineItems: InvoiceItem[] = [];
  protected items = new Map();
  protected item!: InvoiceItem;

  protected subTotal = 0;
  protected grossSubTotal = 0;

  constructor(protected invoice: Invoice) {}

  public async process() {
    if (this.invoice?.line_items || this.invoice.line_items?.length === 0) {
      return this.items;
    }

    return this;
  }

  protected calculateLineItems() {
    this.invoice.line_items.map((item: InvoiceItem) => {
      this.item = item;

      this.cleanLineItem().sumLineItem().setDiscount().push();
    });

    return this;
  }

  protected cleanLineItem() {
    // ..

    return this;
  }

  protected sumLineItem() {
    this.item.line_total = this.item.cost * this.item.quantity;

    return this;
  }

  protected setDiscount() {
    if (this.invoice.is_amount_discount) {
      this.item.line_total = this.item.line_total - 10; // We don't have definitive number formatter, need to implement that & then replace this with propert formatted value.
    } else {
      const discount = this.item.line_total * (this.item.discount / 100);

      this.item.line_total = this.item.line_total - discount; // We need formatter here also.
    }

    this.item.is_amount_discount = this.invoice.is_amount_discount;

    return this;
  }

  protected calculateTaxes() {
    let itemTax = 0;

    const amount =
      this.item.line_total -
      this.item.line_total * (this.invoice.discount / 100);

    //

    const itemTaxRateOneLocal = this.calculateAmountLineTax(
      this.item.tax_rate1,
      amount
    );

    itemTax += itemTaxRateOneLocal;

    if (this.item.tax_name1.length >= 1) {
      this.groupTax(this.item.tax_name1, this.item.tax_rate1, amount);
    }

    //

    const itemTaxRateTwoLocal = this.calculateAmountLineTax(
      this.item.tax_rate2,
      amount
    );

    itemTax += itemTaxRateTwoLocal;

    if (this.item.tax_name2.length >= 1) {
      this.groupTax(this.item.tax_name2, this.item.tax_rate2, amount);
    }

    //

    const itemTaxRateThreeLocal = this.calculateAmountLineTax(
      this.item.tax_rate3,
      amount
    );

    itemTax += itemTaxRateThreeLocal;

    if (this.item.tax_name3.length >= 1) {
      this.groupTax(this.item.tax_name3, this.item.tax_rate3, amount);
    }

    this.item.gross_line_total = this.item.line_total + itemTax;

    return this;
  }

  protected groupTax(name: string, rate: number, total: number) {
    let group = {};

    const key = name + rate.toString().replace(' ', ''); // 'Tax Rate' + '5' => 'TaxRate5'

    group = { key, total, name: `${name} ${parseFloat(rate.toString())} %` }; // 'Tax Rate 5.00%'

    this.taxCollection.push(group);
  }

  protected calculateAmountLineTax(rate: number, amount: number) {
    // This needs extraction, it's calling generic Taxer class.
    // This also depends on Number class, previously mentioned.

    return (amount * rate) / 100;
  }

  protected push() {
    this.subTotal += this.item.line_total;

    this.grossSubTotal += this.item.gross_line_total;

    this.lineItems.push(this.item);

    return this;
  }
}
