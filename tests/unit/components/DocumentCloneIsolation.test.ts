import React from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Invoice } from '$app/common/interfaces/invoice';
import type { Quote } from '$app/common/interfaces/quote';
import type { Credit } from '$app/common/interfaces/credit';
import type { PurchaseOrder } from '$app/common/interfaces/purchase-order';
import type { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';
import { CloneOptionsModal as InvoiceClone } from '$app/pages/invoices/common/components/CloneOptionsModal';
import { CloneOptionsModal as QuoteClone } from '$app/pages/quotes/common/components/CloneOptionsModal';
import { CloneOptionsModal as CreditClone } from '$app/pages/credits/common/components/CloneOptionsModal';
import { CloneOptionsModal as PurchaseOrderClone } from '$app/pages/purchase-orders/common/components/CloneOptionsModal';
import { CloneOptionsModal as RecurringInvoiceClone } from '$app/pages/recurring-invoices/common/components/CloneOptionsModal';
import fixture from '../../helpers/data/invoice';
import { useInvoiceUtilities } from '$app/pages/invoices/create/hooks/useInvoiceUtilities';
import { InvoiceItemType } from '$app/common/interfaces/invoice-item';

const mocks = vi.hoisted(() => ({
  setDocument: vi.fn(),
  current: undefined as Invoice | undefined,
  navigate: vi.fn(),
}));
vi.mock('jotai', async (importOriginal) => ({
  ...(await importOriginal<typeof import('jotai')>()),
  useSetAtom: () => mocks.setDocument,
  useAtom: () => [mocks.current, mocks.setDocument],
}));
vi.mock('react-router-dom', () => ({ useNavigate: () => mocks.navigate }));
vi.mock('react-i18next', () => ({
  useTranslation: () => [(key: string) => key],
}));
vi.mock('$app/common/hooks/useCurrentCompany', () => ({
  useCurrentCompany: () => ({ settings: {} }),
}));
vi.mock('$app/common/hooks/useResolveCurrency', () => ({
  useResolveCurrency: () => vi.fn(),
}));
vi.mock('$app/common/colors', () => ({ useColorScheme: () => ({}) }));
vi.mock('$app/common/hooks/useInvoiceEditor', () => ({
  useInvoiceEditorPaths: () => ({ create: '/invoices/create' }),
}));
vi.mock('$app/common/hooks/permissions/useHasPermission', () => ({
  useHasPermission: () => () => true,
}));
vi.mock('$app/common/hooks/useCompanyChanges', () => ({
  useCompanyChanges: () => ({ settings: {} }),
}));
// Keep the real clone callbacks; replace only their presentation components.
vi.mock('$app/components/CloneOption', () => ({ CloneOption: 'button' }));
vi.mock('$app/components/EntityActionElement', () => ({
  EntityActionElement: 'entity-action',
}));
vi.mock('$app/components/Modal', () => ({ Modal: 'modal' }));

const sources = [
  [
    'invoice',
    (doc: Invoice) =>
      React.createElement(InvoiceClone, {
        invoice: doc,
        dropdown: false,
        isPeppol: false,
      }),
  ],
  [
    'Peppol invoice',
    (doc: Invoice) =>
      React.createElement(InvoiceClone, {
        invoice: doc,
        dropdown: false,
        isPeppol: true,
      }),
  ],
  [
    'quote',
    (doc: Invoice) =>
      React.createElement(QuoteClone, {
        quote: doc as unknown as Quote,
        dropdown: false,
      }),
  ],
  [
    'credit',
    (doc: Invoice) =>
      React.createElement(CreditClone, {
        credit: doc as unknown as Credit,
        dropdown: false,
      }),
  ],
  [
    'purchase order',
    (doc: Invoice) =>
      React.createElement(PurchaseOrderClone, {
        purchaseOrder: doc as unknown as PurchaseOrder,
        dropdown: false,
      }),
  ],
  [
    'recurring invoice',
    (doc: Invoice) =>
      React.createElement(RecurringInvoiceClone, {
        recurringInvoice: doc as unknown as RecurringInvoice,
        dropdown: false,
      }),
  ],
] as const;

// Each destination is exercised through the real component's click handler.
const destinations = [
  'invoice',
  'quote',
  'credit',
  'purchase_order',
  'recurring_invoice',
];
let renderer: ReactTestRenderer | undefined;
beforeEach(() => {
  vi.clearAllMocks();
  mocks.current = undefined;
  mocks.setDocument.mockImplementation((value) => {
    mocks.current = typeof value === 'function' ? value(mocks.current) : value;
  });
  vi.useFakeTimers();
});
afterEach(() => {
  if (renderer) act(() => renderer!.unmount());
  renderer = undefined;
  vi.useRealTimers();
});

describe.each(sources)('%s cloning isolation', (_, render) => {
  it.each(
    destinations
  )('editing a cloned %s must not change the source', (destination) => {
    const source = structuredClone(fixture);
    const before = structuredClone(source);
    act(() => {
      renderer = create(render(source));
    });
    const option = renderer!.root
      .findAllByType('button')
      .find((node) => node.props.label === destination);
    expect(option, `Missing clone option: ${destination}`).toBeDefined();
    act(() => {
      option!.props.onClick();
      vi.runAllTimers();
    });
    expect(mocks.setDocument).toHaveBeenCalledTimes(1);
    const clone = mocks.setDocument.mock.lastCall![0] as Invoice;
    expect(clone).not.toBe(source);
    expect(clone.line_items.length).toBeGreaterThan(0);
    expect(mocks.navigate).toHaveBeenCalled();

    // The current editors mutate item properties and splice their arrays.
    clone.line_items[0].notes = 'Edited in the new document';
    clone.line_items.splice(0, 1);
    expect(source).toEqual(before);
  });
});

// Exercise the real clone callback followed by the real detailed-editor handlers.
// DataTable passes its cached row directly to the clone action; the detailed
// create route preserves that handoff for action=clone.
function cloneInvoice(source: Invoice) {
  if (renderer) act(() => renderer!.unmount());
  act(() => {
    renderer = create(
      React.createElement(InvoiceClone, {
        invoice: source,
        dropdown: true,
        isPeppol: false,
      })
    );
  });
  const option = renderer!.root
    .findAllByType('button')
    .find((node) => node.props.label === 'invoice');
  act(() => option!.props.onClick());
}

describe('repeated cloning from the cached list row into the detailed editor', () => {
  it('a later clone must not inherit an abandoned clone’s description edits', () => {
    const cachedRow = structuredClone(fixture);
    const originalNotes = cachedRow.line_items[0].notes;
    cloneInvoice(cachedRow);
    useInvoiceUtilities({}).handleLineItemPropertyChange(
      'notes',
      'Only intended for the abandoned draft',
      0
    );
    // Return to the list without saving, then clone the same cached row again.
    cloneInvoice(cachedRow);
    expect(mocks.current!.line_items[0].notes).toBe(originalNotes);
  });

  it('a later clone must not inherit an abandoned clone’s line deletions', () => {
    const cachedRow = structuredClone(fixture);
    const originalCount = cachedRow.line_items.length;
    cloneInvoice(cachedRow);
    useInvoiceUtilities({}).handleDeleteLineItem(0);
    cloneInvoice(cachedRow);
    expect(mocks.current!.line_items).toHaveLength(originalCount);
  });

  it('adding a new line does not merge that new line into a later clone', () => {
    const cachedRow = structuredClone(fixture);
    const originalCount = cachedRow.line_items.length;
    cloneInvoice(cachedRow);
    useInvoiceUtilities({}).handleCreateLineItem(InvoiceItemType.Product);
    expect(mocks.current!.line_items).toHaveLength(originalCount + 1);
    cloneInvoice(cachedRow);
    expect(mocks.current!.line_items).toHaveLength(originalCount);
  });
});
