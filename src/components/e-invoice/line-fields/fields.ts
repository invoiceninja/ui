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

export interface EInvoiceLineField {
  key: string;
  label: string;
  businessTerm: string;
  path: string;
  type: 'text' | 'date';
}

export interface EInvoiceLineOption {
  key: string;
  label: string;
  help: string;
  businessTerm: string;
  fields: EInvoiceLineField[];
}

export const E_INVOICE_LINE_OPTIONS: EInvoiceLineOption[] = [
  {
    key: 'order_line_reference',
    label: 'order_line_reference',
    help: 'order_line_reference_help',
    businessTerm: 'BT-132',
    fields: [
      {
        key: 'order_line_reference',
        label: 'order_line_reference',
        businessTerm: 'BT-132',
        path: 'OrderLineReference.0.LineID.value',
        type: 'text',
      },
    ],
  },
  {
    key: 'buyer_accounting_reference',
    label: 'buyer_accounting_reference',
    help: 'buyer_accounting_reference_help',
    businessTerm: 'BT-133',
    fields: [
      {
        key: 'buyer_accounting_reference',
        label: 'buyer_accounting_reference',
        businessTerm: 'BT-133',
        path: 'AccountingCost',
        type: 'text',
      },
    ],
  },
  {
    key: 'line_note',
    label: 'line_note',
    help: 'line_note_help',
    businessTerm: 'BT-127',
    fields: [
      {
        key: 'line_note',
        label: 'line_note',
        businessTerm: 'BT-127',
        path: 'Note',
        type: 'text',
      },
    ],
  },
  {
    key: 'line_period',
    label: 'line_period',
    help: 'line_period_help',
    businessTerm: 'BT-134, BT-135',
    fields: [
      {
        key: 'line_period_start',
        label: 'start_date',
        businessTerm: 'BT-134',
        path: 'InvoicePeriod.0.StartDate',
        type: 'date',
      },
      {
        key: 'line_period_end',
        label: 'end_date',
        businessTerm: 'BT-135',
        path: 'InvoicePeriod.0.EndDate',
        type: 'date',
      },
    ],
  },
];

export const E_INVOICE_LINE_FIELDS = E_INVOICE_LINE_OPTIONS.flatMap(
  (option) => option.fields
);

const EXPOSED_LINE_PATHS = 'Exposed.InvoiceLine';

const LINE_KEYS: Record<EInvoiceLinesRoot, string> = {
  Invoice: 'InvoiceLine',
  CreditNote: 'CreditNoteLine',
};

const UNSUPPORTED_E_INVOICE_TYPES = ['FatturaPA', 'FACT1'];

const FEE_LINE_TYPES = [InvoiceItemType.UnpaidFee, InvoiceItemType.PaidFee];

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

export const isEInvoiceLineFieldsSupported = (type: string | undefined) => {
  return (
    !UNSUPPORTED_E_INVOICE_TYPES.includes(type ?? '') &&
    !(type ?? '').startsWith('Facturae')
  );
};

export const getExposedLinePaths = (eInvoice: unknown): string[] => {
  const paths: unknown = get(eInvoice, EXPOSED_LINE_PATHS);

  return Array.isArray(paths)
    ? paths.filter((path) => typeof path === 'string' && path.trim() !== '')
    : [];
};

export const getCustomLinePaths = (paths: string[]) => {
  return paths.filter(
    (path, index) =>
      paths.indexOf(path) === index &&
      !E_INVOICE_LINE_FIELDS.some((field) => field.path === path)
  );
};

export const isLineOptionEnabled = (
  paths: string[],
  option: EInvoiceLineOption
) => {
  return option.fields.some((field) => paths.includes(field.path));
};

export const toggleExposedLinePaths = (
  paths: string[],
  removed: string[],
  added: string[]
) => {
  return [...paths.filter((path) => !removed.includes(path)), ...added];
};

export const withExposedLinePaths = (eInvoice: unknown, paths: string[]) => {
  const next = asObject(eInvoice);
  const exposed = asObject(next.Exposed);

  if (paths.length) {
    exposed.InvoiceLine = paths;
  } else {
    delete exposed.InvoiceLine;
  }

  if (isEmpty(exposed)) {
    delete next.Exposed;
  } else {
    next.Exposed = exposed;
  }

  return next;
};

export const getLineEntries = (
  eInvoice: unknown,
  root: EInvoiceLinesRoot
): EInvoiceLineEntry[] => {
  return toEntries(get(eInvoice, [root, LINE_KEYS[root]]));
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
  const value = get(entries[index], field.path);

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
    removePath(next[index], field.path);
  } else {
    set(next[index], field.path, value);
  }

  return next;
};

export const hasLineValues = (entries: EInvoiceLineEntry[]) => {
  return entries.some((entry) => !isEmpty(entry));
};

export const countLinesWithValues = (entries: EInvoiceLineEntry[]) => {
  return entries.filter((entry) => !isEmpty(entry)).length;
};

export const resolveLineFields = (
  paths: string[],
  entries: EInvoiceLineEntry[]
) => {
  return E_INVOICE_LINE_FIELDS.filter(
    (field) =>
      paths.includes(field.path) ||
      entries.some((_, index) => getLineValue(entries, index, field) !== '')
  );
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
