/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { cloneDeep, get, isEmpty, isEqual, isPlainObject, set } from 'lodash';
import { v4 } from 'uuid';
import {
  InvoiceItem,
  InvoiceItemType,
} from '$app/common/interfaces/invoice-item';

export type EInvoiceLinesRoot = 'Invoice' | 'CreditNote';

export type EInvoiceLineEntry = Record<string, unknown>;

interface EInvoiceLineCatalogField {
  key: string;
  label: string;
  help: string;
  path: string;
}

export interface EInvoiceLineField {
  key: string;
  label: string;
  path: string;
  valuePath: string;
  isCustom?: boolean;
}

export const E_INVOICE_LINE_FIELDS: EInvoiceLineCatalogField[] = [
  {
    key: 'order_reference',
    label: 'order_reference',
    help: 'order_reference_help',
    path: 'OrderLineReference.OrderReference.ID',
  },
  {
    key: 'order_line_reference',
    label: 'order_line_reference',
    help: 'order_line_reference_help',
    path: 'OrderLineReference.LineID',
  },
  {
    key: 'buyer_item_identifier',
    label: 'buyer_item_identifier',
    help: 'buyer_item_identifier_help',
    path: 'Item.BuyersItemIdentification.ID',
  },
  {
    key: 'seller_item_identifier',
    label: 'seller_item_identifier',
    help: 'seller_item_identifier_help',
    path: 'Item.SellersItemIdentification.ID',
  },
];

const LINE_KEYS: Record<EInvoiceLinesRoot, string> = {
  Invoice: 'InvoiceLine',
  CreditNote: 'CreditNoteLine',
};

const FEE_LINE_TYPES = [InvoiceItemType.UnpaidFee, InvoiceItemType.PaidFee];

interface Leaf {
  path: string;
  value: unknown;
}

const isContainer = (value: unknown) => {
  return Array.isArray(value) || isPlainObject(value);
};

const isEmptyContainer = (value: unknown) => {
  return isContainer(value) && isEmpty(value);
};

const isBlank = (value: unknown) => {
  return (
    value === undefined ||
    value === null ||
    value === '' ||
    isEmptyContainer(value)
  );
};

const withoutIndexes = (path: string) => {
  return path
    .split('.')
    .filter((segment) => !/^\d+$/.test(segment))
    .join('.');
};

const humanize = (path: string) => {
  return withoutIndexes(path)
    .split('.')
    .map((segment) => segment.replace(/([a-z])([A-Z])/g, '$1 $2'))
    .join(' › ');
};

const collectLeaves = (value: unknown, path = ''): Leaf[] => {
  if (!isContainer(value) || isEmptyContainer(value)) {
    return path ? [{ path, value }] : [];
  }

  return Object.entries(value as EInvoiceLineEntry).flatMap(([key, child]) =>
    collectLeaves(child, path ? `${path}.${key}` : key)
  );
};

const findCatalogField = (path: string) => {
  return E_INVOICE_LINE_FIELDS.find(
    (field) => field.path === withoutIndexes(path)
  );
};

const toLineField = (path: string, valuePath: string): EInvoiceLineField => {
  const catalogField = findCatalogField(path);

  return catalogField
    ? { key: catalogField.key, label: catalogField.label, path, valuePath }
    : { key: path, label: humanize(path), path, valuePath, isCustom: true };
};

const removeAt = (target: EInvoiceLineEntry, segments: string[]) => {
  const container =
    segments.length > 1 ? get(target, segments.slice(0, -1)) : target;
  const key = segments[segments.length - 1];

  if (Array.isArray(container)) {
    container.splice(Number(key), 1);
    return;
  }

  if (isPlainObject(container)) {
    delete (container as EInvoiceLineEntry)[key];
  }
};

const removePath = (target: EInvoiceLineEntry, path: string) => {
  const segments = path.split('.');

  if (typeof get(target, segments) === 'undefined') {
    return;
  }

  removeAt(target, segments);

  for (let depth = segments.length - 1; depth > 0; depth--) {
    if (!isEmptyContainer(get(target, segments.slice(0, depth)))) {
      return;
    }

    removeAt(target, segments.slice(0, depth));
  }
};

const toEntries = (value: unknown): EInvoiceLineEntry[] => {
  if (Array.isArray(value)) {
    return value.map((entry) =>
      isPlainObject(entry) ? (entry as EInvoiceLineEntry) : {}
    );
  }

  if (!isPlainObject(value)) {
    return [];
  }

  const indexes = Object.keys(value as EInvoiceLineEntry)
    .filter((key) => /^\d+$/.test(key))
    .map(Number);

  if (!indexes.length) {
    return [];
  }

  const entries: EInvoiceLineEntry[] = Array.from(
    { length: Math.max(...indexes) + 1 },
    () => ({})
  );

  indexes.forEach((index) => {
    const entry = (value as EInvoiceLineEntry)[index];

    entries[index] = isPlainObject(entry) ? (entry as EInvoiceLineEntry) : {};
  });

  return entries;
};

const trimTrailingEmpty = (entries: EInvoiceLineEntry[]) => {
  const trimmed = [...entries];

  while (trimmed.length && isEmpty(trimmed[trimmed.length - 1])) {
    trimmed.pop();
  }

  return trimmed;
};

const asObject = (value: unknown): EInvoiceLineEntry => {
  return isPlainObject(value) ? cloneDeep(value as EInvoiceLineEntry) : {};
};

export const withLineIds = (lineItems: InvoiceItem[]): InvoiceItem[] => {
  return lineItems.map((lineItem) =>
    lineItem._id ? lineItem : { ...lineItem, _id: v4() }
  );
};

export const getLineTemplate = (eInvoice: unknown): EInvoiceLineEntry => {
  return toEntries(get(eInvoice, 'Invoice.InvoiceLine'))[0] ?? {};
};

export const getTemplateFields = (
  template: EInvoiceLineEntry
): EInvoiceLineField[] => {
  return collectLeaves(template).map((leaf) =>
    toLineField(
      leaf.path,
      isContainer(leaf.value) ? `${leaf.path}.value` : leaf.path
    )
  );
};

export const getTemplatePaths = (template: EInvoiceLineEntry) => {
  return collectLeaves(template)
    .map((leaf) => leaf.path)
    .sort();
};

export const isTemplateFieldEnabled = (
  template: EInvoiceLineEntry,
  field: EInvoiceLineCatalogField
) => {
  return collectLeaves(template).some(
    (leaf) => withoutIndexes(leaf.path) === field.path
  );
};

export const toggleTemplateField = (
  template: EInvoiceLineEntry,
  path: string,
  enabled: boolean
) => {
  const next = cloneDeep(template);

  collectLeaves(next)
    .filter(
      (leaf) =>
        leaf.path === path || withoutIndexes(leaf.path) === withoutIndexes(path)
    )
    .reverse()
    .forEach((leaf) => removePath(next, leaf.path));

  if (enabled) {
    set(next, path, {});
  }

  return next;
};

export const withLineTemplate = (
  eInvoice: unknown,
  template: EInvoiceLineEntry
) => {
  const next = asObject(eInvoice);
  const invoice = asObject(next.Invoice);

  if (isEmpty(template)) {
    delete invoice.InvoiceLine;
  } else {
    invoice.InvoiceLine = [template];
  }

  if (isEmpty(invoice)) {
    delete next.Invoice;
  } else {
    next.Invoice = invoice;
  }

  return next;
};

export const getLineEntries = (
  eInvoice: unknown,
  root: EInvoiceLinesRoot
): EInvoiceLineEntry[] => {
  return toEntries(get(eInvoice, [root, LINE_KEYS[root]]));
};

export const getEntryFields = (
  entries: EInvoiceLineEntry[]
): EInvoiceLineField[] => {
  const valuePaths = [
    ...new Set(
      entries.flatMap((entry) =>
        collectLeaves(entry)
          .filter((leaf) => !isBlank(leaf.value))
          .map((leaf) => leaf.path)
      )
    ),
  ];

  return valuePaths.map((valuePath) =>
    toLineField(valuePath.replace(/\.value$/, ''), valuePath)
  );
};

export const withLineEntries = (
  eInvoice: unknown,
  root: EInvoiceLinesRoot,
  entries: EInvoiceLineEntry[]
) => {
  const next = asObject(eInvoice);
  const container = asObject(next[root]);
  const dense = trimTrailingEmpty(
    entries.map((entry) => (isPlainObject(entry) ? entry : {}))
  );

  if (dense.length) {
    container[LINE_KEYS[root]] = dense;
  } else {
    delete container[LINE_KEYS[root]];
  }

  if (isEmpty(container)) {
    delete next[root];
  } else {
    next[root] = container;
  }

  return next;
};

export const withCreditReference = (
  eInvoice: unknown,
  number: string,
  date: string
) => {
  const next = asObject(eInvoice);
  const creditNote = asObject(next.CreditNote);

  if (number) {
    creditNote.BillingReference = [
      { InvoiceDocumentReference: { ID: number, IssueDate: date } },
    ];
  } else {
    delete creditNote.BillingReference;
  }

  if (isEmpty(creditNote)) {
    delete next.CreditNote;
  } else {
    next.CreditNote = creditNote;
  }

  return next;
};

export const normalizeLineEntries = (
  eInvoice: unknown,
  root: EInvoiceLinesRoot
) => {
  if (typeof get(eInvoice, [root, LINE_KEYS[root]]) === 'undefined') {
    return eInvoice;
  }

  return withLineEntries(eInvoice, root, getLineEntries(eInvoice, root));
};

export const getLineValue = (
  entries: EInvoiceLineEntry[],
  index: number,
  field: EInvoiceLineField
) => {
  const value = get(entries[index], field.valuePath);

  return typeof value === 'string' || typeof value === 'number'
    ? String(value)
    : '';
};

export const setLineValue = (
  entries: EInvoiceLineEntry[],
  index: number,
  field: EInvoiceLineField,
  value: string
) => {
  const next = entries.map((entry) => cloneDeep(entry));

  while (next.length <= index) {
    next.push({});
  }

  if (isBlank(value)) {
    removePath(next[index], field.valuePath);
  } else {
    set(next[index], field.valuePath, value);
  }

  return next;
};

const hasLineValues = (entries: EInvoiceLineEntry[]) => {
  return entries.some((entry) => !isEmpty(entry));
};

export const countLinesWithValues = (entries: EInvoiceLineEntry[]) => {
  return entries.filter((entry) => !isEmpty(entry)).length;
};

export const realignLineEntries = (
  entries: EInvoiceLineEntry[],
  previousIds: string[],
  nextIds: string[],
  withoutOverlap: 'keep' | 'drop' = 'keep'
): EInvoiceLineEntry[] | null => {
  if (!hasLineValues(entries) || isEqual(previousIds, nextIds)) {
    return null;
  }

  if (!nextIds.length) {
    return [];
  }

  const positions = new Map<string, number[]>();

  previousIds.forEach((id, index) => {
    if (id) {
      positions.set(id, [...(positions.get(id) ?? []), index]);
    }
  });

  if (!nextIds.some((id) => positions.has(id))) {
    return withoutOverlap === 'drop' ? [] : null;
  }

  const realigned = nextIds.map((id) => {
    const position = id ? positions.get(id)?.shift() : undefined;

    return typeof position === 'number' ? (entries[position] ?? {}) : {};
  });

  return isEqual(trimTrailingEmpty(realigned), trimTrailingEmpty(entries))
    ? null
    : realigned;
};

export const withoutFeeLineEntries = <
  T extends { line_items: InvoiceItem[]; e_invoice?: unknown },
>(
  resource: T,
  root: EInvoiceLinesRoot
): T => {
  const entries = getLineEntries(resource.e_invoice, root);

  if (
    !hasLineValues(entries) ||
    !resource.line_items.some((lineItem) =>
      FEE_LINE_TYPES.includes(lineItem.type_id)
    )
  ) {
    return resource;
  }

  return {
    ...resource,
    e_invoice: withLineEntries(
      resource.e_invoice,
      root,
      entries.filter((_, index) => {
        const typeId = resource.line_items[index]?.type_id;

        return !typeId || !FEE_LINE_TYPES.includes(typeId);
      })
    ),
  };
};
