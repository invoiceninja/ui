/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */
import collect from 'collect.js';
import { Credit } from '$app/common/interfaces/credit';
import { Currency } from '$app/common/interfaces/currency';
import { Invoice } from '$app/common/interfaces/invoice';
import { InvoiceItem } from '$app/common/interfaces/invoice-item';
import { PurchaseOrder } from '$app/common/interfaces/purchase-order';
import { Quote } from '$app/common/interfaces/quote';
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';
import type { TaxItem } from './invoice-sum';
import {
  formatTaxName,
  percentageOf,
  precisionOrDefault,
  roundToPrecision,
  taxKey,
  unroundedPercentageOf,
} from './round';

interface LineTaxDefinition {
  name: string;
  rate: number;
  taxId: string;
}

export class InvoiceItemSum {
  public taxCollection = collect<TaxItem>();

  public lineItems: InvoiceItem[] = [];
  protected items = new Map();
  protected item!: InvoiceItem;

  public subTotal = 0;
  protected grossSubTotal = 0;
  public totalTaxes = 0;

  constructor(
    protected invoice:
      | Invoice
      | RecurringInvoice
      | PurchaseOrder
      | Credit
      | Quote,
    protected currency: Currency,
    protected eInvoiceType?: string
  ) {}

  protected get precision(): number {
    return precisionOrDefault(this.currency?.precision);
  }

  public get isPeppol(): boolean {
    return this.eInvoiceType === 'PEPPOL';
  }

  public async process() {
    if (!this.invoice?.line_items || this.invoice.line_items?.length === 0) {
      return this.items;
    }

    this.calculateLineItems().addPeppolSurchargeTaxes();

    return this;
  }

  protected calculateLineItems() {
    this.invoice.line_items.map((item: InvoiceItem) => {
      this.item = item;

      this.cleanLineItem().sumLineItem().setDiscount().calculateTaxes().push();
    });

    return this;
  }

  protected cleanLineItem() {
    // ..

    return this;
  }

  protected sumLineItem() {
    this.item.line_total = roundToPrecision(
      this.item.cost * this.item.quantity + 0.000000000000004,
      2
    );

    return this;
  }

  protected setDiscount() {
    if (this.invoice.is_amount_discount) {
      const discount = roundToPrecision(this.item.discount, this.precision);

      this.item.line_total = roundToPrecision(
        this.item.line_total - discount,
        2
      );
    } else {
      const discount = unroundedPercentageOf(
        this.item.line_total,
        this.item.discount
      );
      const lineTotal = roundToPrecision(
        this.item.line_total - discount,
        this.precision
      );

      this.item.line_total = roundToPrecision(lineTotal, 2);
    }

    this.item.is_amount_discount = this.invoice.is_amount_discount;

    return this;
  }

  protected calculateTaxes() {
    let itemTax = 0;

    const amount =
      this.item.line_total -
      unroundedPercentageOf(this.item.line_total, this.invoice.discount);

    const itemTaxRateOneLocal = this.calculateAmountLineTax(
      this.item.tax_rate1,
      amount
    );

    itemTax += itemTaxRateOneLocal;

    if (this.item.tax_name1.length > 1) {
      this.groupTax(
        this.item.tax_name1,
        this.item.tax_rate1,
        itemTaxRateOneLocal,
        amount,
        this.item.tax_id
      );
    }

    //

    const itemTaxRateTwoLocal = this.calculateAmountLineTax(
      this.item.tax_rate2,
      amount
    );

    itemTax += itemTaxRateTwoLocal;

    if (this.item.tax_name2.length > 1) {
      this.groupTax(
        this.item.tax_name2,
        this.item.tax_rate2,
        itemTaxRateTwoLocal,
        amount,
        this.item.tax_id
      );
    }

    const itemTaxRateThreeLocal = this.calculateAmountLineTax(
      this.item.tax_rate3,
      amount
    );

    itemTax += itemTaxRateThreeLocal;

    if (this.item.tax_name3.length > 1) {
      this.groupTax(
        this.item.tax_name3,
        this.item.tax_rate3,
        itemTaxRateThreeLocal,
        amount,
        this.item.tax_id
      );
    }

    const taxAmount = isNaN(itemTax)
      ? 0
      : roundToPrecision(itemTax, this.precision);

    this.item.gross_line_total = roundToPrecision(
      this.item.line_total + taxAmount,
      this.precision
    );
    this.item.tax_amount = taxAmount;
    this.item.net_cost = this.item.cost;

    this.totalTaxes += taxAmount;

    return this;
  }

  protected groupTax(
    name: string,
    rate: number,
    total: number,
    baseAmount = 0,
    taxId = ''
  ) {
    if (name.length === 0) return;

    const group: TaxItem = {
      key: taxKey(name, rate),
      total,
      name: formatTaxName(name, rate),
      tax_id: taxId,
      tax_rate: rate,
      base_amount: baseAmount,
    };

    this.taxCollection.push(group);
  }

  protected calculateAmountLineTax(rate: number, amount: number) {
    const result = Number((amount * ((rate ?? 0) / 100)).toPrecision(15));

    if (this.isPeppol) {
      return result;
    }

    return roundToPrecision(result, 2);
  }

  protected push() {
    this.subTotal += roundToPrecision(
      this.item.line_total + 0.000000000000004,
      this.precision
    );
    this.subTotal = roundToPrecision(this.subTotal, this.precision);

    this.grossSubTotal += this.item.gross_line_total;

    this.lineItems.push(this.item);

    return this;
  }

  public calculateTaxesWithAmountDiscount() {
    this.taxCollection = collect<TaxItem>();

    this.totalTaxes = 0;

    this.lineItems
      // .filter((item) => item.line_total > 0)
      .map((item, index: number) => {
        let itemTax = 0;
        this.item = item;

        if (item.line_total != 0) {
          const amount =
            this.subTotal === 0
              ? this.item.line_total
              : this.item.line_total -
                this.item.line_total * (this.invoice.discount / this.subTotal);

          const itemTaxRateOneTotal = this.calculateAmountLineTax(
            this.item.tax_rate1,
            amount
          );

          itemTax += itemTaxRateOneTotal;

          if (this.item.tax_name1.length > 1 || itemTaxRateOneTotal !== 0) {
            this.groupTax(
              this.item.tax_name1,
              this.item.tax_rate1,
              itemTaxRateOneTotal,
              amount,
              this.item.tax_id
            );
          }

          //

          const itemTaxRateTwoTotal = this.calculateAmountLineTax(
            this.item.tax_rate2,
            amount
          );

          itemTax += itemTaxRateTwoTotal;

          if (this.item.tax_name2.length > 1 || itemTaxRateTwoTotal !== 0) {
            this.groupTax(
              this.item.tax_name2,
              this.item.tax_rate2,
              itemTaxRateTwoTotal,
              amount,
              this.item.tax_id
            );
          }

          //

          const itemTaxRateThree = this.calculateAmountLineTax(
            this.item.tax_rate3,
            amount
          );

          itemTax += itemTaxRateThree;

          if (this.item.tax_name3.length > 1 || itemTaxRateThree !== 0) {
            this.groupTax(
              this.item.tax_name3,
              this.item.tax_rate3,
              itemTaxRateThree,
              amount,
              this.item.tax_id
            );
          }

          const taxAmount = isNaN(itemTax)
            ? 0
            : roundToPrecision(itemTax, this.precision);

          this.item.gross_line_total = roundToPrecision(
            this.item.line_total + taxAmount,
            this.precision
          );
          this.item.tax_amount = taxAmount;
          this.item.net_cost = this.item.cost;
        }

        this.lineItems[index] = this.item;
        this.totalTaxes += isNaN(itemTax)
          ? 0
          : roundToPrecision(itemTax, this.precision);
      });

    this.addPeppolSurchargeTaxes();

    return this;
  }

  protected addPeppolSurchargeTaxes() {
    if (!this.isPeppol) {
      return this;
    }

    const surchargeTotal = this.getSurchargeValues().reduce(
      (sum, surcharge) => sum + surcharge,
      0
    );

    if (surchargeTotal === 0) {
      return this;
    }

    this.getUniqueLineTaxes().forEach(({ name, rate, taxId }) => {
      const taxComponent = this.getSurchargeValues().reduce(
        (sum, surcharge) => sum + percentageOf(surcharge, rate, 2),
        0
      );

      if (taxComponent > 0) {
        this.groupTax(name, rate, taxComponent, surchargeTotal, taxId);
        this.totalTaxes += taxComponent;
      }
    });

    return this;
  }

  protected getSurchargeValues() {
    return [
      this.invoice.custom_surcharge1,
      this.invoice.custom_surcharge2,
      this.invoice.custom_surcharge3,
      this.invoice.custom_surcharge4,
    ].map((surcharge) => surcharge || 0);
  }

  protected getUniqueLineTaxes() {
    const definitions: LineTaxDefinition[] = [];

    this.lineItems.forEach((item) => {
      [
        { name: item.tax_name1, rate: item.tax_rate1 },
        { name: item.tax_name2, rate: item.tax_rate2 },
        { name: item.tax_name3, rate: item.tax_rate3 },
      ].forEach(({ name, rate }) => {
        if (name.length > 1) {
          definitions.push({ name, rate, taxId: item.tax_id });
        }
      });
    });

    const seen = new Set<string>();

    return definitions.filter(({ name, rate }) => {
      const key = taxKey(name, rate);

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);

      return true;
    });
  }
}
