/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */
import { InvoiceItemSumInclusive } from './invoice-item-sum-inclusive';
import { Invoice } from '$app/common/interfaces/invoice';
import collect from 'collect.js';
import { Credit } from '$app/common/interfaces/credit';
import { PurchaseOrder } from '$app/common/interfaces/purchase-order';
import { Quote } from '$app/common/interfaces/quote';
import { TaxItem } from './invoice-sum';
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';
import { Currency } from '$app/common/interfaces/currency';
import { NumberFormatter } from '../number-formatter';

export class InvoiceSumInclusive {
  protected taxMap = collect<TaxItem>();
  public declare invoiceItems: InvoiceItemSumInclusive;
  protected totalTaxMap: Record<string, unknown>[] = [];

  public totalDiscount = 0;
  public total = 0;
  public totalTaxes = 0;
  public totalCustomValues = 0;
  public subTotal = 0;

  constructor(
    public invoice: Invoice | Credit | PurchaseOrder | Quote | RecurringInvoice,
    protected currency: Currency
  ) {
    this.invoiceItems = new InvoiceItemSumInclusive(this.invoice);
  }

  public build() {
    this.calculateLineItems()
      .calculateDiscount()
      .calculateCustomValues()
      .calculateInvoiceTaxes()
      .setTaxMap()
      .calculateTotals()
      // .calculatePartial();
      .calculateBalance();

    return this;
  }

  protected calculateLineItems() {
    this.invoiceItems.process();

    this.invoice.line_items = this.invoiceItems.lineItems;
    this.total = this.invoiceItems.subTotal;
    this.subTotal = this.invoiceItems.subTotal;

    return this;
  }

  protected calculateDiscount() {
    this.totalDiscount = this.discount(this.invoiceItems.subTotal);
    this.total -= this.totalDiscount;

    return this;
  }

  protected calculateInvoiceTaxes() {
    let amount = this.total;

    if (this.invoice.discount > 0 && this.invoice.is_amount_discount) {
      amount = this.subTotal - this.invoice.discount;
    }

    if (this.invoice.discount > 0 && !this.invoice.is_amount_discount) {
      amount = this.subTotal - this.subTotal * (this.invoice.discount / 100);
    }

    if (this.invoice.tax_rate1 > 0) {
      const tax = this.calcInclusiveLineTax(amount, this.invoice.tax_rate1);

      this.totalTaxes += tax;

      this.totalTaxMap.push({
        name: `${this.invoice.tax_name1} ${parseFloat(
          this.invoice.tax_rate1.toFixed(this.currency.precision)
        )} %`,
      });
    }

    if (this.invoice.tax_rate2 > 0) {
      const tax = this.calcInclusiveLineTax(amount, this.invoice.tax_rate2);

      this.totalTaxes += tax;

      this.totalTaxMap.push({
        name: `${this.invoice.tax_name2} ${parseFloat(
          this.invoice.tax_rate2.toFixed(this.currency.precision)
        )} %`,
      });
    }

    if (this.invoice.tax_rate3 > 0) {
      const tax = this.calcInclusiveLineTax(amount, this.invoice.tax_rate3);

      this.totalTaxes += tax;

      this.totalTaxMap.push({
        name: `${this.invoice.tax_name3} ${parseFloat(
          this.invoice.tax_rate3.toFixed(this.currency.precision)
        )} %`,
      });
    }

    return this;
  }

  public getTaxMap() {
    return this.taxMap;
  }

  protected calculateCustomValues() {
    this.totalCustomValues += this.valuer(this.invoice.custom_surcharge1);
    this.totalCustomValues += this.valuer(this.invoice.custom_surcharge2);
    this.totalCustomValues += this.valuer(this.invoice.custom_surcharge3);
    this.totalCustomValues += this.valuer(this.invoice.custom_surcharge4);

    this.total += this.totalCustomValues;

    return this;
  }

  protected getSurchargeTaxTotalForKey(taxName: string, rate: number) {
    let taxComponent = 0;

    if (this.invoice.custom_surcharge_tax1) {
      taxComponent += parseFloat(
        (this.invoice.custom_surcharge1 * (rate / 100)).toFixed(
          this.currency.precision
        )
      );
    }

    if (this.invoice.custom_surcharge_tax2) {
      taxComponent += parseFloat(
        (this.invoice.custom_surcharge2 * (rate / 100)).toFixed(
          this.currency.precision
        )
      );
    }

    if (this.invoice.custom_surcharge_tax3) {
      taxComponent += parseFloat(
        (this.invoice.custom_surcharge3 * (rate / 100)).toFixed(
          this.currency.precision
        )
      );
    }

    if (this.invoice.custom_surcharge_tax4) {
      taxComponent += parseFloat(
        (this.invoice.custom_surcharge4 * (rate / 100)).toFixed(
          this.currency.precision
        )
      );
    }

    return taxComponent;
  }

  protected setTaxMap() {
    if (this.invoice.is_amount_discount) {
      this.invoiceItems.calculateTaxesWithAmountDiscount();
      this.invoice.line_items = this.invoiceItems.lineItems;
    }

    this.taxMap = collect();

    let taxCollection = collect<TaxItem>();
    taxCollection = this.invoiceItems.taxCollection.pluck('items');

    const keys = taxCollection.pluck('key').unique();

    keys.map((key) => {
      const taxName = taxCollection
        .filter((item) => item.key === key)
        .pluck('name')
        .first();

      const totalLineTax = taxCollection
        .filter((item) => item.key === key)
        .sum('total');

      this.taxMap.push({
        name: taxName as string,
        total: totalLineTax as number,
      });

      this.totalTaxes += totalLineTax as number;
    });

    return this;
  }

  protected calculateTotals() {
    this.totalTaxes = Number(this.totalTaxes.toFixed(this.currency.precision));

    return this;
  }

  protected calculateBalance() {
    this.setCalculatedAttributes();

    return this;
  }

  protected setCalculatedAttributes() {

    this.invoice.amount = parseFloat(
      NumberFormatter.formatValue(this.total, this.currency.precision)
    );

    this.invoice.balance =
      parseFloat(
        NumberFormatter.formatValue(this.total, this.currency.precision)
      ) - (this.invoice.paid_to_date ?? 0);

    this.invoice.total_taxes = this.totalTaxes;

    return this;
  }

  // protected calculatePartial() {
  //   if (!this.invoice?.id && this.invoice.partial && this.invoice.balance) {
  //     this.invoice.partial = Math.max(
  //       0,
  //       Math.min(this.invoice.partial, this.invoice.balance)
  //     ); // Needs formatting (with rounding 2)
  //   }

  //   return this;
  // }

  public getBalanceDue() {

    return (this.invoice.partial && this.invoice.partial > 0) ? Math.min(this.invoice.partial, this.invoice.balance) : this.invoice.balance;

  }

  /////////////

  protected discount(amount: number) {
    // This needs extraction in the invoice service/class.

    if (this.invoice.is_amount_discount) {
      return this.invoice.discount;
    }

    return parseFloat(
      (amount * (this.invoice.discount / 100)).toFixed(this.currency.precision)
    );
  }

  protected taxer(amount: number, tax_rate: number) {
    // This needs extraction in the taxer service/class.

    return parseFloat(
      (amount * ((tax_rate ?? 0) / 100)).toFixed(this.currency.precision)
    );
  }

  protected valuer(customValue: number | undefined): number {
    // This needs extraction in the custom valuer service/class.

    if (typeof customValue === 'number') {
      return customValue;
    }

    return 0;
  }

  protected calcInclusiveLineTax(amount: number, rate: number) {
    return amount - amount / (1 + rate / 100);
  }
}
