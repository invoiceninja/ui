import { InvoiceItemSum } from './invoice-item-sum';
import { Invoice } from 'common/interfaces/invoice';
import collect from 'collect.js';
import { InvoiceStatus } from 'common/enums/invoice-status';

export class InvoiceSum {
  protected taxMap = collect();
  protected invoiceItems = new InvoiceItemSum(this.invoice);
  protected totalTaxMap: Record<string, unknown>[] = [];

  public totalDiscount = 0;
  public total = 0;
  public totalTaxes = 0;
  public totalCustomValues = 0;

  constructor(public invoice: Invoice) {}

  public async build() {
    await this.calculateLineItems();
    await this.calculateDiscount();
    await this.calculateInvoiceTaxes();
    await this.calculateCustomValues();
    await this.setTaxMap();
    await this.calculateTotals();
    await this.calculateBalance();
    await this.calculatePartial();

    this.totalDiscount = 123;

    return this;
  }

  protected async calculateLineItems() {
    await this.invoiceItems.process();

    this.invoice.line_items = this.invoiceItems.lineItems;
    this.total = this.invoiceItems.subTotal;

    return this;
  }

  protected async calculateDiscount() {
    this.totalDiscount = this.discount(this.invoiceItems.subTotal);
    this.total -= this.totalDiscount;

    return this;
  }

  protected async calculateInvoiceTaxes() {
    if (this.invoice.tax_name1.length >= 1) {
      let tax = this.taxer(this.total, this.invoice.tax_rate1);

      tax += this.getSurchargeTaxTotalForKey(
        this.invoice.tax_name1,
        this.invoice.tax_rate1
      );

      this.totalTaxes += tax;

      this.totalTaxMap.push({
        name: `${this.invoice.tax_name1} ${parseFloat(
          this.invoice.tax_rate1.toFixed(2)
        )} %`,
      });
    }

    if (this.invoice.tax_name2.length >= 1) {
      let tax = this.taxer(this.total, this.invoice.tax_rate2);

      tax += this.getSurchargeTaxTotalForKey(
        this.invoice.tax_name2,
        this.invoice.tax_rate2
      );

      this.totalTaxes += tax;

      this.totalTaxMap.push({
        name: `${this.invoice.tax_name2} ${parseFloat(
          this.invoice.tax_rate2.toFixed(2)
        )} %`,
      });
    }

    if (this.invoice.tax_name3.length >= 1) {
      let tax = this.taxer(this.total, this.invoice.tax_rate3);

      tax += this.getSurchargeTaxTotalForKey(
        this.invoice.tax_name3,
        this.invoice.tax_rate3
      );

      this.totalTaxes += tax;

      this.totalTaxMap.push({
        name: `${this.invoice.tax_name3} ${parseFloat(
          this.invoice.tax_rate3.toFixed(2)
        )} %`,
      });
    }

    return this;
  }

  protected async calculateCustomValues() {
    this.totalCustomValues += this.valuer(this.invoice.custom_surcharge1);
    this.totalCustomValues += this.valuer(this.invoice.custom_surcharge2);
    this.totalCustomValues += this.valuer(this.invoice.custom_surcharge3);
    this.totalCustomValues += this.valuer(this.invoice.custom_surcharge4);

    return this;
  }

  protected getSurchargeTaxTotalForKey(taxName: string, rate: number) {
    let taxComponent = 0;

    if (this.invoice.custom_surcharge_tax1) {
      taxComponent += parseFloat(
        (this.invoice.custom_surcharge1 * (rate / 100)).toFixed(2)
      );
    }

    if (this.invoice.custom_surcharge_tax2) {
      taxComponent += parseFloat(
        (this.invoice.custom_surcharge2 * (rate / 100)).toFixed(2)
      );
    }

    if (this.invoice.custom_surcharge_tax3) {
      taxComponent += parseFloat(
        (this.invoice.custom_surcharge3 * (rate / 100)).toFixed(2)
      );
    }

    if (this.invoice.custom_surcharge_tax4) {
      taxComponent += parseFloat(
        (this.invoice.custom_surcharge4 * (rate / 100)).toFixed(2)
      );
    }

    return taxComponent;
  }

  protected async setTaxMap() {
    if (this.invoice.is_amount_discount) {
      this.invoiceItems.calculateTaxesWithAmountDiscount();
    }

    this.taxMap = collect();

    const keys = this.invoiceItems.taxCollection.pluck('key').unique();
    const values = this.invoiceItems.taxCollection;

    keys.map((key) => {
      const taxName = values
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .filter((value) => value[key as string] == key)
        .pluck('tax_name')
        .first();

      const totalLineTax = values
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .filter((value) => value[key as string] === key)
        .sum('total');

      this.taxMap.push({ name: taxName, total: totalLineTax });

      this.totalTaxes += this.invoiceItems.totalTaxes;

    });

    return this;
  }

  protected async calculateTotals() {
    this.total += this.totalTaxes;

    return this;
  }

  protected async calculateBalance() {
    this.setCalculatedAttributes();

    return this;
  }

  protected setCalculatedAttributes() {
    if (this.invoice.status_id !== InvoiceStatus.Draft) {
      if (this.invoice.amount !== this.invoice.balance) {
        const paidToDate = this.invoice.amount - this.invoice.balance;

        this.invoice.balance = this.total - paidToDate; // Needs implementing formatting with number class.
      } else {
        this.invoice.balance = this.total; // Needs implementing formatting with number class.
      }
    }

    this.invoice.amount = this.total; // Needs implementing formatting with number class.
    this.invoice.total_taxes = this.totalTaxes;

    return this;
  }

  protected calculatePartial() {
    if (!this.invoice?.id && this.invoice.partial) {
      this.invoice.partial = Math.max(
        0,
        Math.min(this.invoice.partial, this.invoice.balance)
      ); // Needs formatting (with rounding 2)
    }

    return this;
  }

  /////////////

  protected discount(amount: number) {
    // This needs extraction in the invoice service/class.

    if (this.invoice.is_amount_discount) {
      return this.invoice.discount;
    }

    return parseFloat((amount * (this.invoice.discount / 100)).toFixed(2));
  }

  protected taxer(amount: number, tax_rate: number) {
    // This needs extraction in the taxer service/class.

    return parseFloat((amount * ((tax_rate ?? 0) / 100)).toFixed(2));
  }

  protected valuer(customValue: number | undefined): number {
    // This needs extraction in the custom valuer service/class.

    if (typeof customValue === 'number') {
      return customValue;
    }

    return 0;
  }
}
