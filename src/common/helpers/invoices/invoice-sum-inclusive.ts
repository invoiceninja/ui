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
import {
  formatTaxName,
  percentageOf,
  precisionOrDefault,
  roundToPrecision,
} from './round';

export class InvoiceSumInclusive {
  protected taxMap = collect<TaxItem>();
  public declare invoiceItems: InvoiceItemSumInclusive;
  protected totalTaxMap: TaxItem[] = [];

  public totalDiscount = 0;
  public total = 0;
  public totalTaxes = 0;
  public totalCustomValues = 0;
  public subTotal = 0;

  constructor(
    public invoice: Invoice | Credit | PurchaseOrder | Quote | RecurringInvoice,
    protected currency: Currency,
    protected eInvoiceType?: string
  ) {
    this.invoiceItems = new InvoiceItemSumInclusive(
      this.invoice,
      this.currency,
      this.eInvoiceType
    );
  }

  protected get precision(): number {
    return precisionOrDefault(this.currency?.precision);
  }

  public get isPeppol(): boolean {
    return this.eInvoiceType === 'PEPPOL';
  }

  public build() {
    this.calculateLineItems()
      .calculateDiscount()
      .calculateInvoiceTaxes()
      .calculateCustomValues()
      .setTaxMap()
      .calculateTotals()
      .calculateBalance()
      .calculatePartial();

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
    this.totalTaxMap = [];

    if (this.invoice.discount > 0 && this.invoice.is_amount_discount) {
      amount = roundToPrecision(this.subTotal - this.invoice.discount, 2);
    }

    if (this.invoice.discount > 0 && !this.invoice.is_amount_discount) {
      amount = roundToPrecision(
        this.subTotal - this.subTotal * (this.invoice.discount / 100),
        2
      );
    }

    amount += this.getTaxableSurchargeTotal();

    [
      { name: this.invoice.tax_name1, rate: this.invoice.tax_rate1 },
      { name: this.invoice.tax_name2, rate: this.invoice.tax_rate2 },
      { name: this.invoice.tax_name3, rate: this.invoice.tax_rate3 },
    ].forEach(({ name, rate }) => {
      if (name.length <= 1 || rate <= 0) {
        return;
      }

      const tax = this.calcInclusiveLineTax(amount, rate);

      this.totalTaxes += tax;
      this.totalTaxMap.push({
        name: formatTaxName(name, rate, this.precision),
        total: tax,
        tax_rate: rate,
        base_amount: amount - tax,
      });
    });

    return this;
  }

  public getTaxMap() {
    return this.taxMap;
  }

  public getTotalTaxMap() {
    return collect<TaxItem>(this.totalTaxMap);
  }

  public getSubTotal() {
    return roundToPrecision(this.subTotal ?? 0, 2);
  }

  public getTotalDiscount() {
    return roundToPrecision(this.totalDiscount ?? 0, 2);
  }

  public getTotalTaxes() {
    return this.totalTaxes;
  }

  public getTotal() {
    return roundToPrecision(this.total ?? 0, 2);
  }

  public getTotalSurcharges() {
    return this.totalCustomValues;
  }

  public getSubtotalWithSurcharges() {
    return this.getSubTotal() + this.getTotalSurcharges();
  }

  public getTotalNetSurcharges() {
    return this.invoiceItems.getCustomSurchargeNetMap().sum('total') as number;
  }

  public getNetSubtotal() {
    return this.getSubTotal() - this.getTotalDiscount();
  }

  protected calculateCustomValues() {
    this.totalCustomValues += this.valuer(this.invoice.custom_surcharge1);
    this.totalCustomValues += this.valuer(this.invoice.custom_surcharge2);
    this.totalCustomValues += this.valuer(this.invoice.custom_surcharge3);
    this.totalCustomValues += this.valuer(this.invoice.custom_surcharge4);

    this.total += this.totalCustomValues;

    return this;
  }

  protected getTaxableSurchargeTotal() {
    return [
      {
        amount: this.invoice.custom_surcharge1,
        taxable: this.invoice.custom_surcharge_tax1,
      },
      {
        amount: this.invoice.custom_surcharge2,
        taxable: this.invoice.custom_surcharge_tax2,
      },
      {
        amount: this.invoice.custom_surcharge3,
        taxable: this.invoice.custom_surcharge_tax3,
      },
      {
        amount: this.invoice.custom_surcharge4,
        taxable: this.invoice.custom_surcharge_tax4,
      },
    ].reduce((total, surcharge) => {
      if (
        !surcharge.taxable ||
        typeof surcharge.amount !== 'number' ||
        surcharge.amount <= 0
      ) {
        return total;
      }

      return total + surcharge.amount;
    }, 0);
  }

  protected setTaxMap() {
    if (this.invoice.is_amount_discount) {
      this.invoiceItems.calculateTaxesWithAmountDiscount();
      this.invoice.line_items = this.invoiceItems.lineItems;
    }

    this.taxMap = collect<TaxItem>();

    const taxCollection = this.invoiceItems.taxCollection;

    const keys = taxCollection.pluck('key').unique();

    keys.map((key) => {
      const matchingTaxes = taxCollection.filter((item) => item.key === key);
      const firstTax = matchingTaxes.first() as TaxItem | undefined;

      if (!firstTax) {
        return;
      }

      const totalLineTax = matchingTaxes.sum('total') as number;
      const baseAmount = matchingTaxes.sum('base_amount') as number;

      this.taxMap.push({
        key: key as string,
        name: firstTax.name,
        total: totalLineTax,
        tax_id: firstTax.tax_id,
        tax_rate: firstTax.tax_rate,
        base_amount: roundToPrecision(baseAmount, 2),
      });

      this.totalTaxes += totalLineTax;
    });

    return this;
  }

  protected calculateTotals() {
    return this;
  }

  protected calculateBalance() {
    this.setCalculatedAttributes();

    return this;
  }

  protected setCalculatedAttributes() {
    this.invoice.amount = parseFloat(
      NumberFormatter.formatValue(this.getTotal(), this.precision)
    );

    const balance = this.shouldZeroBalance()
      ? 0
      : this.invoice.amount - (this.invoice.paid_to_date ?? 0);

    this.invoice.balance = parseFloat(
      NumberFormatter.formatValue(balance, this.precision)
    );

    this.invoice.total_taxes = this.totalTaxes;

    return this;
  }

  protected shouldZeroBalance() {
    return (
      this.invoice.entity_type === 'invoice' && this.invoice.status_id === '5'
    );
  }

  protected calculatePartial() {
    if (!this.invoice?.id && this.invoice.partial && this.invoice.balance) {
      const roundedPartial = roundToPrecision(this.invoice.partial, 2);

      this.invoice.partial = Math.max(
        0,
        Math.min(roundedPartial, this.invoice.balance)
      );
    }

    return this;
  }

  public getBalanceDue() {
    return this.invoice.partial && this.invoice.partial > 0
      ? Math.min(this.invoice.partial, this.invoice.balance)
      : this.invoice.balance;
  }

  /////////////

  protected discount(amount: number) {
    // This needs extraction in the invoice service/class.

    if (this.invoice.is_amount_discount) {
      return this.invoice.discount;
    }

    return percentageOf(amount, this.invoice.discount, 2);
  }

  protected valuer(customValue: number | undefined): number {
    // This needs extraction in the custom valuer service/class.

    if (typeof customValue === 'number') {
      return customValue;
    }

    return 0;
  }

  protected calcInclusiveLineTax(amount: number, rate: number) {
    if (!rate) {
      return 0;
    }

    return roundToPrecision(amount - amount / (1 + rate / 100), 2);
  }
}
