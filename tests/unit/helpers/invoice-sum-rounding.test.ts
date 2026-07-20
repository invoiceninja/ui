import { describe, it, expect } from 'vitest';
import { InvoiceSum } from '../../../src/common/helpers/invoices/invoice-sum';
import { InvoiceSumInclusive } from '../../../src/common/helpers/invoices/invoice-sum-inclusive';
import { InclusiveTax } from '../../../src/common/helpers/invoices/inclusive-tax';
import { Invoice } from '../../../src/common/interfaces/invoice';
import {
  InvoiceItem,
  InvoiceItemType,
} from '../../../src/common/interfaces/invoice-item';
import currencies from '../../helpers/data/currencies';

const USD = currencies[0];
const JPY = currencies.find((c: { code: string }) => c.code === 'JPY')!;
const THREE_DECIMAL = { ...USD, id: 'test-3', code: 'TDP', precision: 3 };

function makeInvoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: 'test',
    user_id: 'test',
    project_id: '',
    assigned_user_id: '',
    amount: 0,
    balance: 0,
    client_id: 'test',
    vendor_id: '',
    status_id: '1',
    design_id: '',
    recurring_id: '',
    created_at: 0,
    updated_at: 0,
    archived_at: 0,
    is_deleted: false,
    number: '',
    discount: 0,
    po_number: '',
    date: '',
    last_sent_date: '',
    next_send_date: '',
    due_date: '',
    terms: '',
    public_notes: '',
    private_notes: '',
    uses_inclusive_taxes: false,
    tax_name1: '',
    tax_rate1: 0,
    tax_name2: '',
    tax_rate2: 0,
    tax_name3: '',
    tax_rate3: 0,
    total_taxes: 0,
    is_amount_discount: false,
    footer: '',
    partial: 0,
    partial_due_date: '',
    custom_value1: '',
    custom_value2: '',
    custom_value3: '',
    custom_value4: '',
    has_tasks: false,
    has_expenses: false,
    custom_surcharge1: 0,
    custom_surcharge2: 0,
    custom_surcharge3: 0,
    custom_surcharge4: 0,
    exchange_rate: 1,
    custom_surcharge_tax1: false,
    custom_surcharge_tax2: false,
    custom_surcharge_tax3: false,
    custom_surcharge_tax4: false,
    line_items: [],
    entity_type: 'invoice',
    reminder1_sent: '',
    reminder2_sent: '',
    reminder3_sent: '',
    reminder_last_sent: '',
    paid_to_date: 0,
    subscription_id: '',
    location_id: '',
    auto_bill_enabled: false,
    invitations: [],
    documents: [],
    ...overrides,
  } as Invoice;
}

function makeLineItem(overrides: Partial<InvoiceItem> = {}): InvoiceItem {
  return {
    quantity: 1,
    cost: 0,
    net_cost: 0,
    product_key: '',
    notes: '',
    discount: 0,
    is_amount_discount: false,
    tax_name1: '',
    tax_rate1: 0,
    tax_name2: '',
    tax_rate2: 0,
    tax_name3: '',
    tax_rate3: 0,
    sort_id: 0,
    line_total: 0,
    gross_line_total: 0,
    custom_value1: '',
    custom_value2: '',
    custom_value3: '',
    custom_value4: '',
    type_id: InvoiceItemType.Product,
    task_id: '',
    expense_id: '',
    product_cost: 0,
    date: '',
    tax_id: '1',
    ...overrides,
  };
}

describe('Exclusive tax rounding - round half up', () => {
  it('rounds line item tax correctly for values ending in 5', () => {
    // 10.25 * 10% = 1.025 -> should round to 1.03 (round half up), not 1.02
    const inv = makeInvoice({
      line_items: [
        makeLineItem({
          cost: 10.25,
          quantity: 1,
          tax_name1: 'GST',
          tax_rate1: 10,
        }),
      ],
    });

    const result = new InvoiceSum(inv, USD).build();

    expect(result.subTotal).toEqual(10.25);
    expect(result.totalTaxes).toEqual(1.03);
    expect(result.invoice.amount).toEqual(11.28);
  });

  it('rounds invoice-level tax correctly for values ending in 5', () => {
    // 20.50 * 10% = 2.05 -> should stay 2.05
    // 20.50 * 7.5% = 1.5375 -> should round to 1.54 (round half up)
    const inv = makeInvoice({
      tax_name1: 'GST',
      tax_rate1: 10,
      tax_name2: 'VAT',
      tax_rate2: 7.5,
      line_items: [makeLineItem({ cost: 20.5, quantity: 1 })],
    });

    const result = new InvoiceSum(inv, USD).build();

    expect(result.subTotal).toEqual(20.5);
    expect(result.invoice.amount).toEqual(24.09);
  });

  it('rounds percentage discount correctly for values ending in 5', () => {
    // 15 * 15% = 2.25 discount -> total 12.75
    const inv = makeInvoice({
      discount: 15,
      is_amount_discount: false,
      line_items: [makeLineItem({ cost: 15, quantity: 1 })],
    });

    const result = new InvoiceSum(inv, USD).build();

    expect(result.totalDiscount).toEqual(2.25);
    expect(result.invoice.amount).toEqual(12.75);
  });

  it('handles surcharge tax rounding correctly', () => {
    // surcharge 7.50 * 10% = 0.75
    const inv = makeInvoice({
      tax_name1: 'GST',
      tax_rate1: 10,
      custom_surcharge1: 7.5,
      custom_surcharge_tax1: true,
      line_items: [makeLineItem({ cost: 100, quantity: 1 })],
    });

    const result = new InvoiceSum(inv, USD).build();

    expect(result.subTotal).toEqual(100);
    expect(result.invoice.amount).toEqual(118.25);
  });

  it('accumulates per-line tax then sums (not sum then tax)', () => {
    // Two items: 1.15 each, 10% tax
    // Per line: 1.15 * 10% = 0.115 -> rounds to 0.12 each -> total tax 0.24
    // vs total: 2.30 * 10% = 0.23 (wrong if you sum first)
    const inv = makeInvoice({
      line_items: [
        makeLineItem({
          cost: 1.15,
          quantity: 1,
          tax_name1: 'GST',
          tax_rate1: 10,
        }),
        makeLineItem({
          cost: 1.15,
          quantity: 1,
          tax_name1: 'GST',
          tax_rate1: 10,
        }),
      ],
    });

    const result = new InvoiceSum(inv, USD).build();

    expect(result.subTotal).toEqual(2.3);
    expect(result.totalTaxes).toEqual(0.24);
    expect(result.invoice.amount).toEqual(2.54);
  });

  it('handles multiple tax rates on same line item', () => {
    // 100 * 10% = 10.00, 100 * 7.5% = 7.50, 100 * 5% = 5.00
    const inv = makeInvoice({
      line_items: [
        makeLineItem({
          cost: 100,
          quantity: 1,
          tax_name1: 'GST',
          tax_rate1: 10,
          tax_name2: 'VAT',
          tax_rate2: 7.5,
          tax_name3: 'State',
          tax_rate3: 5,
        }),
      ],
    });

    const result = new InvoiceSum(inv, USD).build();

    expect(result.subTotal).toEqual(100);
    expect(result.totalTaxes).toEqual(22.5);
    expect(result.invoice.amount).toEqual(122.5);
  });

  it('handles negative line items correctly', () => {
    // -10.25 * 10% = -1.025 -> should round to -1.03
    const inv = makeInvoice({
      line_items: [
        makeLineItem({
          cost: -10.25,
          quantity: 1,
          tax_name1: 'GST',
          tax_rate1: 10,
        }),
      ],
    });

    const result = new InvoiceSum(inv, USD).build();

    expect(result.subTotal).toEqual(-10.25);
    expect(result.totalTaxes).toEqual(-1.03);
    expect(result.invoice.amount).toEqual(-11.28);
  });

  it('higher precision cost with tax rounding', () => {
    // 82.6446 * 21% tax
    // line_total rounds to 82.64
    // tax: 82.64 * 21% = 17.3544 -> rounds to 17.35
    const inv = makeInvoice({
      line_items: [
        makeLineItem({
          cost: 82.6446,
          quantity: 1,
          tax_name1: 'VAT',
          tax_rate1: 21,
        }),
      ],
    });

    const result = new InvoiceSum(inv, USD).build();

    expect(result.subTotal).toEqual(82.64);
    expect(result.totalTaxes).toEqual(17.35);
    expect(result.invoice.amount).toEqual(99.99);
  });

  it('many small line items accumulate correctly', () => {
    // 10 items at 0.99 each with 10% tax
    // Per line: 0.99 * 10% = 0.099 -> rounds to 0.10 each -> total tax ~1.00
    const items = Array.from({ length: 10 }, () =>
      makeLineItem({ cost: 0.99, quantity: 1, tax_name1: 'GST', tax_rate1: 10 })
    );

    const inv = makeInvoice({ line_items: items });
    const result = new InvoiceSum(inv, USD).build();

    expect(result.subTotal).toEqual(9.9);
    // floating point accumulation: 10 * 0.10 results in 0.9999999999999999
    expect(result.invoice.amount).toEqual(10.9);
  });
});

describe('Inclusive tax rounding - round half up', () => {
  it('rounds inclusive line item tax correctly', () => {
    // 11 inclusive with 10% tax: tax = 11 - 11/1.1 = 11 - 10 = 1.00
    const inv = makeInvoice({
      uses_inclusive_taxes: true,
      line_items: [
        makeLineItem({
          cost: 11,
          quantity: 1,
          tax_name1: 'GST',
          tax_rate1: 10,
        }),
      ],
    });

    const result = new InvoiceSumInclusive(inv, USD).build();

    expect(result.subTotal).toEqual(11);
    expect(result.totalTaxes).toEqual(1);
    expect(result.invoice.amount).toEqual(11);
  });

  it('rounds inclusive invoice-level tax correctly', () => {
    // 22.00 inclusive with 10%: tax = 22 - 22/1.1 = 22 - 20 = 2.00
    const inv = makeInvoice({
      uses_inclusive_taxes: true,
      tax_name1: 'GST',
      tax_rate1: 10,
      line_items: [makeLineItem({ cost: 22, quantity: 1 })],
    });

    const result = new InvoiceSumInclusive(inv, USD).build();

    expect(result.subTotal).toEqual(22);
    expect(result.totalTaxes).toEqual(2);
    expect(result.invoice.amount).toEqual(22);
  });

  it('handles inclusive tax with percentage discount', () => {
    // 100 with 50% discount = 50, inclusive 10% tax: 50 - 50/1.1 = 50 - 45.4545... = 4.55 (rounded)
    const inv = makeInvoice({
      uses_inclusive_taxes: true,
      discount: 50,
      is_amount_discount: false,
      tax_name1: 'GST',
      tax_rate1: 10,
      line_items: [makeLineItem({ cost: 100, quantity: 1 })],
    });

    const result = new InvoiceSumInclusive(inv, USD).build();

    expect(result.subTotal).toEqual(100);
    expect(result.totalDiscount).toEqual(50);
    expect(result.invoice.amount).toEqual(50);
  });

  it('rounds inclusive surcharge tax correctly', () => {
    const inv = makeInvoice({
      uses_inclusive_taxes: true,
      tax_name1: 'GST',
      tax_rate1: 10,
      custom_surcharge1: 5.5,
      custom_surcharge_tax1: true,
      line_items: [makeLineItem({ cost: 50, quantity: 1 })],
    });

    const result = new InvoiceSumInclusive(inv, USD).build();

    expect(result.subTotal).toEqual(50);
    expect(result.invoice.amount).toEqual(55.5);
  });
});

describe('Zero-precision currency (JPY) rounding', () => {
  it('rounds to whole numbers for JPY', () => {
    const inv = makeInvoice({
      tax_name1: 'Tax',
      tax_rate1: 10,
      line_items: [makeLineItem({ cost: 1000, quantity: 1 })],
    });

    const result = new InvoiceSum(inv, JPY).build();

    expect(result.subTotal).toEqual(1000);
    expect(result.totalTaxes).toEqual(100);
    expect(result.invoice.amount).toEqual(1100);
  });

  it('keeps class totals at API precision before persisting JPY invoice fields', () => {
    // 999 * 8% = 79.92. The API keeps the calculator total at 79.92,
    // then writes invoice.total_taxes and amount using JPY precision.
    const inv = makeInvoice({
      tax_name1: 'Tax',
      tax_rate1: 8,
      line_items: [makeLineItem({ cost: 999, quantity: 1 })],
    });

    const result = new InvoiceSum(inv, JPY).build();

    expect(result.totalTaxes).toEqual(79.92);
    expect(result.total).toEqual(1078.92);
    expect(result.invoice.total_taxes).toEqual(80);
    expect(result.invoice.amount).toEqual(1079);
  });

  it('rounds exclusive JPY line tax at the tax-map category boundary', () => {
    const inv = makeInvoice({
      line_items: [
        makeLineItem({ cost: 4.95, tax_name1: 'Tax', tax_rate1: 10 }),
        makeLineItem({ cost: 4.95, tax_name1: 'Tax', tax_rate1: 10 }),
      ],
    });

    const result = new InvoiceSum(inv, JPY).build();

    expect(result.subTotal).toEqual(10);
    expect(result.getTaxMap().first()?.total).toEqual(1);
    expect(result.totalTaxes).toEqual(1);
    expect(result.invoice.total_taxes).toEqual(1);
    expect(result.invoice.amount).toEqual(11);
  });

  it('rounds inclusive JPY line tax to currency precision in invoice tax totals', () => {
    const inv = makeInvoice({
      uses_inclusive_taxes: true,
      line_items: [makeLineItem({ cost: 10, tax_name1: 'Tax', tax_rate1: 10 })],
    });

    const result = new InvoiceSumInclusive(inv, JPY).build();
    const item = result.invoice.line_items[0];

    expect(result.subTotal).toEqual(10);
    expect(item.tax_amount).toEqual(1);
    expect(result.getTaxMap().first()?.total).toEqual(1);
    expect(result.totalTaxes).toEqual(1);
    expect(result.invoice.total_taxes).toEqual(1);
    expect(result.invoice.amount).toEqual(10);
  });

  it('rounds inclusive JPY tax per component to currency precision with the shared net as base', () => {
    const inv = makeInvoice({
      uses_inclusive_taxes: true,
      line_items: [
        makeLineItem({
          cost: 15,
          tax_name1: 'Tax',
          tax_rate1: 10,
          tax_name2: 'Levy',
          tax_rate2: 10,
        }),
      ],
    });

    const result = new InvoiceSumInclusive(inv, JPY).build();
    const item = result.invoice.line_items[0];
    const taxRows = result.getTaxMap();

    expect(item.tax_amount).toEqual(2);
    expect(item.net_cost).toEqual(13);
    expect(taxRows.pluck('total').all()).toEqual([1, 1]);
    expect(taxRows.pluck('base_amount').all()).toEqual([13, 13]);
    expect(result.totalTaxes).toEqual(2);
    expect(result.invoice.total_taxes).toEqual(2);
    expect(result.invoice.amount).toEqual(15);
  });
});

describe('toFixed vs roundToPrecision difference cases', () => {
  it('correctly rounds 2.345 (toFixed would give 2.34 in some engines)', () => {
    // This is the classic case where toFixed can fail
    // 23.45 * 10% = 2.345 -> should be 2.35
    const inv = makeInvoice({
      line_items: [
        makeLineItem({
          cost: 23.45,
          quantity: 1,
          tax_name1: 'Tax',
          tax_rate1: 10,
        }),
      ],
    });

    const result = new InvoiceSum(inv, USD).build();

    expect(result.totalTaxes).toEqual(2.35);
    expect(result.invoice.amount).toEqual(25.8);
  });

  it('correctly rounds 0.615 (toFixed gives 0.61 in some engines)', () => {
    // 12.30 * 5% = 0.615 -> should be 0.62
    const inv = makeInvoice({
      line_items: [
        makeLineItem({
          cost: 12.3,
          quantity: 1,
          tax_name1: 'Tax',
          tax_rate1: 5,
        }),
      ],
    });

    const result = new InvoiceSum(inv, USD).build();

    expect(result.totalTaxes).toEqual(0.62);
    expect(result.invoice.amount).toEqual(12.92);
  });

  it('correctly rounds 1.255 (toFixed gives 1.25 in some engines)', () => {
    // 25.10 * 5% = 1.255 -> should be 1.26
    const inv = makeInvoice({
      line_items: [
        makeLineItem({
          cost: 25.1,
          quantity: 1,
          tax_name1: 'Tax',
          tax_rate1: 5,
        }),
      ],
    });

    const result = new InvoiceSum(inv, USD).build();

    expect(result.totalTaxes).toEqual(1.26);
    expect(result.invoice.amount).toEqual(26.36);
  });

  it('correctly rounds invoice percentage discount at .5 boundary', () => {
    // 33.50 * 15% discount = 5.025, matching PHP_ROUND_HALF_UP should round to 5.03
    const inv = makeInvoice({
      discount: 15,
      is_amount_discount: false,
      line_items: [makeLineItem({ cost: 33.5, quantity: 1 })],
    });

    const result = new InvoiceSum(inv, USD).build();

    expect(result.totalDiscount).toEqual(5.03);
    expect(result.invoice.amount).toEqual(28.47);
  });

  it('rounds exclusive line percentage discounts after subtracting the raw discount', () => {
    // 33.50 - (33.50 * 15%) = 28.475 -> 28.48 at the line boundary.
    const inv = makeInvoice({
      line_items: [makeLineItem({ cost: 33.5, quantity: 1, discount: 15 })],
    });

    const result = new InvoiceSum(inv, USD).build();
    const item = result.invoice.line_items[0];

    expect(item.line_total).toEqual(28.48);
    expect(result.subTotal).toEqual(28.48);
    expect(result.invoice.amount).toEqual(28.48);
  });
});

describe('API parity invoice sum fields', () => {
  it('calculates exclusive net subtotal after invoice discount', () => {
    const inv = makeInvoice({
      discount: 10,
      is_amount_discount: false,
      line_items: [makeLineItem({ cost: 100, quantity: 1 })],
    });

    const result = new InvoiceSum(inv, USD).build();

    expect(result.subTotal).toEqual(100);
    expect(result.totalDiscount).toEqual(10);
    expect(result.getNetSubtotal()).toEqual(90);
  });

  it('calculates inclusive net subtotal after discount and extracted taxes', () => {
    const inv = makeInvoice({
      uses_inclusive_taxes: true,
      discount: 10,
      is_amount_discount: true,
      tax_name1: 'GST',
      tax_rate1: 10,
      line_items: [makeLineItem({ cost: 110, quantity: 1 })],
    });

    const result = new InvoiceSumInclusive(inv, USD).build();

    expect(result.subTotal).toEqual(110);
    expect(result.totalDiscount).toEqual(10);
    expect(result.totalTaxes).toEqual(9.09);
    expect(result.getNetSubtotal()).toEqual(100);
  });

  it('keeps invoice-level taxes separate from line taxes', () => {
    const inv = makeInvoice({
      tax_name1: 'GST',
      tax_rate1: 10,
      line_items: [
        makeLineItem({
          cost: 100,
          quantity: 1,
          tax_name1: 'VAT',
          tax_rate1: 5,
        }),
      ],
    });

    const result = new InvoiceSum(inv, USD).build();
    const totalTax = result.getTotalTaxMap().first();
    const lineTax = result.getTaxMap().first();

    expect(result.getTotalTaxMap().count()).toEqual(1);
    expect(result.getTaxMap().count()).toEqual(1);
    expect(totalTax?.name).toEqual('GST 10 %');
    expect(totalTax?.total).toEqual(10);
    expect(lineTax?.name).toEqual('VAT 5 %');
    expect(lineTax?.total).toEqual(5);
    expect(result.totalTaxes).toEqual(15);
  });

  it('does not include non-taxable inclusive surcharges in invoice tax extraction', () => {
    const inv = makeInvoice({
      uses_inclusive_taxes: true,
      tax_name1: 'GST',
      tax_rate1: 10,
      custom_surcharge1: 10,
      custom_surcharge_tax1: false,
      line_items: [makeLineItem({ cost: 100, quantity: 1 })],
    });

    const result = new InvoiceSumInclusive(inv, USD).build();

    expect(result.invoice.amount).toEqual(110);
    expect(result.totalTaxes).toEqual(9.09);
    expect(result.getTotalTaxMap().first()?.total).toEqual(9.09);
  });

  it('includes taxable inclusive surcharges in invoice tax extraction', () => {
    const inv = makeInvoice({
      uses_inclusive_taxes: true,
      tax_name1: 'GST',
      tax_rate1: 10,
      custom_surcharge1: 10,
      custom_surcharge_tax1: true,
      line_items: [makeLineItem({ cost: 100, quantity: 1 })],
    });

    const result = new InvoiceSumInclusive(inv, USD).build();

    expect(result.invoice.amount).toEqual(110);
    expect(result.totalTaxes).toEqual(10);
    expect(result.getTotalTaxMap().first()?.total).toEqual(10);
  });

  it('writes calculated tax fields back to exclusive line items', () => {
    const inv = makeInvoice({
      line_items: [
        makeLineItem({
          cost: 100,
          quantity: 1,
          tax_name1: 'GST',
          tax_rate1: 10,
        }),
      ],
    });

    const result = new InvoiceSum(inv, USD).build();
    const item = result.invoice.line_items[0];

    expect(item.tax_amount).toEqual(10);
    expect(item.gross_line_total).toEqual(110);
    expect(item.net_cost).toEqual(100);
  });

  it('writes extracted tax and net cost back to inclusive line items', () => {
    const inv = makeInvoice({
      uses_inclusive_taxes: true,
      line_items: [
        makeLineItem({
          cost: 110,
          quantity: 1,
          tax_name1: 'GST',
          tax_rate1: 10,
        }),
      ],
    });

    const result = new InvoiceSumInclusive(inv, USD).build();
    const item = result.invoice.line_items[0];

    expect(item.tax_amount).toEqual(10);
    expect(item.gross_line_total).toEqual(110);
    expect(item.net_cost).toEqual(100);
  });

  it('stores inclusive tax-map base amounts as net taxable amounts', () => {
    const inv = makeInvoice({
      uses_inclusive_taxes: true,
      line_items: [
        makeLineItem({
          cost: 110,
          tax_name1: 'GST',
          tax_rate1: 10,
        }),
      ],
    });

    const result = new InvoiceSumInclusive(inv, USD).build();

    expect(result.getTaxMap().first()?.total).toEqual(10);
    expect(result.getTaxMap().first()?.base_amount).toEqual(100);
  });

  it('suppresses zero inclusive amount-discount tax rows after recalculation', () => {
    const inv = makeInvoice({
      uses_inclusive_taxes: true,
      is_amount_discount: true,
      discount: 0,
      line_items: [
        makeLineItem({
          cost: 0.01,
          tax_name1: 'GST',
          tax_rate1: 10,
        }),
      ],
    });

    const result = new InvoiceSumInclusive(inv, USD).build();
    const item = result.invoice.line_items[0];

    expect(item.tax_amount).toEqual(0);
    expect(item.net_cost).toEqual(0.01);
    expect(result.getTaxMap().count()).toEqual(0);
    expect(result.totalTaxes).toEqual(0);
  });

  it('rounds new partial amounts to 2 decimals before applying the balance cap', () => {
    const exclusive = makeInvoice({
      id: undefined,
      partial: 10.555,
      line_items: [makeLineItem({ cost: 100 })],
    });
    const inclusive = makeInvoice({
      id: undefined,
      uses_inclusive_taxes: true,
      partial: 10.555,
      line_items: [makeLineItem({ cost: 100 })],
    });

    const exclusiveResult = new InvoiceSum(exclusive, JPY).build();
    const inclusiveResult = new InvoiceSumInclusive(inclusive, JPY).build();

    expect(exclusiveResult.invoice.partial).toEqual(10.56);
    expect(inclusiveResult.invoice.partial).toEqual(10.56);
  });

  it('formats inclusive invoice amounts from the API 2-decimal total before currency precision', () => {
    const inv = makeInvoice({
      uses_inclusive_taxes: true,
      custom_surcharge1: 0.005,
      line_items: [makeLineItem({ cost: 1.01 })],
    });

    const result = new InvoiceSumInclusive(inv, THREE_DECIMAL).build();

    expect(result.total).toEqual(1.015);
    expect(result.getTotal()).toEqual(1.02);
    expect(result.invoice.amount).toEqual(1.02);
  });

  it('uses the additive combined-rate back-out for inclusive amount discounts', () => {
    const inv = makeInvoice({
      uses_inclusive_taxes: true,
      is_amount_discount: true,
      discount: 0,
      line_items: [
        makeLineItem({
          cost: 115,
          quantity: 1,
          tax_name1: 'GST',
          tax_rate1: 10,
          tax_name2: 'VAT',
          tax_rate2: 5,
        }),
      ],
    });

    const result = new InvoiceSumInclusive(inv, USD).build();
    const item = result.invoice.line_items[0];

    expect(item.tax_amount).toEqual(15);
    expect(item.net_cost).toEqual(100);
    expect(result.getTaxMap().pluck('total').all()).toEqual([10, 5]);
    expect(result.totalTaxes).toEqual(15);
  });

  it('keeps inclusive line totals at two decimals before JPY invoice rounding', () => {
    const inv = makeInvoice({
      uses_inclusive_taxes: true,
      line_items: [makeLineItem({ cost: 33.5, quantity: 1, discount: 15 })],
    });

    const result = new InvoiceSumInclusive(inv, JPY).build();
    const item = result.invoice.line_items[0];

    expect(item.line_total).toEqual(28.5);
    expect(result.subTotal).toEqual(28.5);
    expect(result.getTotal()).toEqual(28.5);
    expect(result.invoice.amount).toEqual(29);
  });

  it('handles amount-discount tax recalculation when subtotal is zero', () => {
    const inv = makeInvoice({
      is_amount_discount: true,
      discount: 1,
      line_items: [
        makeLineItem({
          cost: 10,
          quantity: 1,
          tax_name1: 'GST',
          tax_rate1: 10,
        }),
        makeLineItem({
          cost: -10,
          quantity: 1,
          tax_name1: 'GST',
          tax_rate1: 10,
        }),
      ],
    });

    const result = new InvoiceSum(inv, USD).build();

    expect(Number.isFinite(result.totalTaxes)).toBe(true);
    expect(result.totalTaxes).toEqual(0);
    expect(result.invoice.line_items[0].tax_amount).toEqual(1);
    expect(result.invoice.line_items[1].tax_amount).toEqual(-1);
  });
});

describe('calculateTotals no-op fix verification', () => {
  it('total is properly rounded in calculateTotals', () => {
    // Setup a scenario where total + taxes produces a value needing rounding
    // 33.33 + 33.33 * 10% = 33.33 + 3.333 -> tax rounds to 3.33
    // total = 33.33 + 3.33 = 36.66 (already clean)
    const inv = makeInvoice({
      tax_name1: 'Tax',
      tax_rate1: 10,
      line_items: [makeLineItem({ cost: 33.33, quantity: 1 })],
    });

    const result = new InvoiceSum(inv, USD).build();

    expect(result.total).toEqual(36.66);
    expect(result.invoice.amount).toEqual(36.66);
  });
});

describe('Issue #12072 - inclusive multi-tax reproduction', () => {
  it('backs $1000 out of two 10% inclusive taxes additively, not compounded', () => {
    const { net, tax, components } = InclusiveTax.backout(1000, [10, 10, 0]);

    expect(net).toEqual(833.34);
    expect(tax).toEqual(166.66);
    expect(components).toEqual([83.33, 83.33, 0]);
    expect(net).not.toEqual(826.45);
  });

  it('shows the additive tax split and reconciling total on an inclusive invoice', () => {
    const inv = makeInvoice({
      uses_inclusive_taxes: true,
      line_items: [
        makeLineItem({
          cost: 1000,
          tax_name1: 'TEST TAX A',
          tax_rate1: 10,
          tax_name2: 'TEST TAX B',
          tax_rate2: 10,
        }),
      ],
    });

    const result = new InvoiceSumInclusive(inv, USD).build();
    const item = result.invoice.line_items[0];
    const taxRows = result.getTaxMap();

    expect(item.net_cost).toEqual(833.34);
    expect(item.tax_amount).toEqual(166.66);
    expect(taxRows.pluck('name').all()).toEqual([
      'TEST TAX A 10 %',
      'TEST TAX B 10 %',
    ]);
    expect(taxRows.pluck('total').all()).toEqual([83.33, 83.33]);
    expect(result.totalTaxes).toEqual(166.66);
    expect(result.invoice.total_taxes).toEqual(166.66);
    expect(result.invoice.amount).toEqual(1000);
    expect(result.getSubTotal()).toEqual(1000);
  });
});
