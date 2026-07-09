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

export class InvoiceItemSumInclusive {
  public taxCollection = collect<TaxItem>();
  public customSurchargeNetMap = collect<TaxItem>();

  public lineItems: InvoiceItem[] = [];
  protected items = new Map();
  protected item!: InvoiceItem;

  public subTotal = 0;
  protected grossSubTotal = 0;
  public totalTaxes = 0;

  constructor(
    protected invoice:
      | Invoice
      | Credit
      | Quote
      | PurchaseOrder
      | RecurringInvoice,
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
    // we are using typescript, we don't have to clean anything.

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
      const discount = roundToPrecision(
        this.item.line_total * (this.item.discount / 100),
        this.precision
      );

      this.item.line_total = roundToPrecision(
        this.item.line_total - discount,
        2
      );
    }

    this.item.is_amount_discount = this.invoice.is_amount_discount;

    return this;
  }

  protected calculateTaxes() {
    let itemTax = 0;

    const amount =
      this.item.line_total -
      unroundedPercentageOf(this.item.line_total, this.invoice.discount);

    //

    const itemTaxRateOneLocal = this.calcInclusiveLineTax(
      this.item.tax_rate1,
      amount
    );

    itemTax += roundToPrecision(itemTaxRateOneLocal, this.precision);

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

    const itemTaxRateTwoLocal = this.calcInclusiveLineTax(
      this.item.tax_rate2,
      amount
    );

    itemTax += roundToPrecision(itemTaxRateTwoLocal, this.precision);

    if (this.item.tax_name2.length > 1) {
      this.groupTax(
        this.item.tax_name2,
        this.item.tax_rate2,
        itemTaxRateTwoLocal,
        amount,
        this.item.tax_id
      );
    }

    //

    const itemTaxRateThreeLocal = this.calcInclusiveLineTax(
      this.item.tax_rate3,
      amount
    );

    itemTax += roundToPrecision(itemTaxRateThreeLocal, this.precision);

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

    this.item.gross_line_total = this.item.line_total;
    this.item.tax_amount = taxAmount;
    this.item.net_cost = this.calculateNetCost(amount, taxAmount);
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
    if (rate > 0 && baseAmount === 0) {
      return;
    }

    const group: TaxItem = {
      key: taxKey(name, rate),
      total,
      name: formatTaxName(name, rate),
      tax_id: taxId,
      tax_rate: rate,
      base_amount:
        rate > 0
          ? roundToPrecision(baseAmount / (1 + rate / 100), 2)
          : baseAmount,
    };

    this.taxCollection.push(group);
  }

  protected calcInclusiveLineTax(rate: number, amount: number) {
    if (!rate) {
      return 0;
    }

    return roundToPrecision(amount - amount / (1 + rate / 100), 2);
  }

  protected calculateNetCost(amount: number, taxAmount: number) {
    if (!this.item.quantity) {
      return this.item.cost;
    }

    return roundToPrecision(
      (amount - taxAmount) / this.item.quantity,
      this.precision
    );
  }

  protected calculateAmountDiscountNetCost(amount: number) {
    if (!this.item.quantity) {
      return this.item.cost;
    }

    const totalRate =
      (this.item.tax_rate1 ?? 0) +
      (this.item.tax_rate2 ?? 0) +
      (this.item.tax_rate3 ?? 0);
    const divisor = 100 + totalRate;

    if (divisor === 0) {
      return this.item.cost;
    }

    const netCost = (amount * (100 / divisor)) / this.item.quantity;

    return roundToPrecision(
      roundToPrecision(netCost, this.precision + 1),
      this.precision
    );
  }

  protected push() {
    this.subTotal += this.item.line_total;

    this.grossSubTotal += this.item.gross_line_total;

    this.lineItems.push(this.item);

    return this;
  }

  public calculateTaxesWithAmountDiscount() {
    this.taxCollection = collect<TaxItem>();
    this.customSurchargeNetMap = collect<TaxItem>();
    this.totalTaxes = 0;

    this.lineItems
      // .filter((item) => item.line_total > 0)
      .map((item, index: number) => {
        let itemTax = 0;
        this.item = item;

        const amount =
          this.subTotal === 0
            ? this.item.line_total
            : this.item.line_total -
              this.invoice.discount * (this.item.line_total / this.subTotal);

        const itemTaxRateOneTotal = this.calcInclusiveLineTax(
          this.item.tax_rate1,
          amount
        );

        itemTax += itemTaxRateOneTotal;

        if (itemTaxRateOneTotal !== 0) {
          this.groupTax(
            this.item.tax_name1,
            this.item.tax_rate1,
            itemTaxRateOneTotal,
            amount,
            this.item.tax_id
          );
        }

        //

        const itemTaxRateTwoTotal = this.calcInclusiveLineTax(
          this.item.tax_rate2,
          amount
        );

        itemTax += itemTaxRateTwoTotal;

        if (itemTaxRateTwoTotal !== 0) {
          this.groupTax(
            this.item.tax_name2,
            this.item.tax_rate2,
            itemTaxRateTwoTotal,
            amount,
            this.item.tax_id
          );
        }

        //

        const itemTaxRateThree = this.calcInclusiveLineTax(
          this.item.tax_rate3,
          amount
        );

        itemTax += itemTaxRateThree;

        if (itemTaxRateThree !== 0) {
          this.groupTax(
            this.item.tax_name3,
            this.item.tax_rate3,
            itemTaxRateThree,
            amount,
            this.item.tax_id
          );
        }

        const taxAmount = isNaN(itemTax) ? 0 : itemTax;

        this.item.gross_line_total = this.item.line_total;
        this.item.tax_amount = taxAmount;
        this.item.net_cost = this.calculateAmountDiscountNetCost(amount);

        this.lineItems[index] = this.item;
        this.totalTaxes += isNaN(itemTax) ? 0 : itemTax;
      });

    this.addPeppolSurchargeTaxes();

    return this;
  }

  public getCustomSurchargeNetMap() {
    return this.customSurchargeNetMap;
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
        (sum, surcharge) => sum + this.calcInclusiveLineTax(rate, surcharge),
        0
      );
      const netComponent = this.getSurchargeValues().reduce(
        (sum, surcharge) =>
          sum + roundToPrecision(surcharge / (1 + rate / 100), 2),
        0
      );

      if (taxComponent > 0) {
        this.groupTax(name, rate, taxComponent, surchargeTotal, taxId);
        this.customSurchargeNetMap.push({
          key: taxKey(name, rate),
          name: formatTaxName(name, rate),
          total: netComponent,
          tax_id: taxId,
          tax_rate: rate,
          base_amount: netComponent,
        });
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
