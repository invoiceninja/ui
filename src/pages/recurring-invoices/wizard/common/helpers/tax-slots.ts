/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { InvoiceItem } from '$app/common/interfaces/invoice-item';

export const TAX_SLOTS = [1, 2, 3] as const;

export type TaxSlot = (typeof TAX_SLOTS)[number];

export const TAX_FIELDS: Record<
  TaxSlot,
  {
    name: 'tax_name1' | 'tax_name2' | 'tax_name3';
    rate: 'tax_rate1' | 'tax_rate2' | 'tax_rate3';
  }
> = {
  1: { name: 'tax_name1', rate: 'tax_rate1' },
  2: { name: 'tax_name2', rate: 'tax_rate2' },
  3: { name: 'tax_name3', rate: 'tax_rate3' },
};

export const visibleTaxSlots = (item: InvoiceItem, enabled: number) => {
  const applied = TAX_SLOTS.filter(
    (slot) => slot <= enabled && Boolean(item[TAX_FIELDS[slot].name])
  );

  const free = TAX_SLOTS.find(
    (slot) => slot <= enabled && !item[TAX_FIELDS[slot].name]
  );

  return free ? [...applied, free] : applied;
};
