import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Invoice } from '$app/common/interfaces/invoice';
import type { Task } from '$app/common/interfaces/task';
import { useInvoiceTask } from '$app/pages/tasks/common/hooks/useInvoiceTask';

const mocks = vi.hoisted(() => ({
  blank: { line_items: [] } as unknown as Invoice,
  setInvoice: vi.fn(),
  navigate: vi.fn(),
  error: vi.fn(),
}));

vi.mock('jotai', async (importOriginal) => ({
  ...(await importOriginal<typeof import('jotai')>()),
  useSetAtom: () => mocks.setInvoice,
}));
vi.mock('$app/common/hooks/useInvoiceEditor', () => ({
  useInvoiceEditorPaths: () => ({ create: '/invoices/create' }),
}));
vi.mock('react-router-dom', () => ({ useNavigate: () => mocks.navigate }));
vi.mock('react-i18next', () => ({
  useTranslation: () => [(key: string) => key],
}));
vi.mock('$app/pages/invoices/common/atoms', () => ({ invoiceAtom: {} }));
vi.mock('$app/common/queries/invoices', () => ({
  // Return the same object across hook instances, as the query cache does.
  useBlankInvoiceQuery: () => ({ data: mocks.blank }),
}));
vi.mock('$app/common/helpers/toast/toast', () => ({
  toast: { error: mocks.error },
}));
vi.mock('$app/common/hooks/useCurrentCompany', () => ({
  useCurrentCompany: () => ({ settings: {}, enabled_tax_rates: 0 }),
}));
vi.mock('$app/common/hooks/useCompanyTimeFormat', () => ({
  useCompanyTimeFormat: () => ({ timeFormat: 'HH:mm' }),
}));
vi.mock('$app/common/hooks/useCurrentCompanyDateFormats', () => ({
  useCurrentCompanyDateFormats: () => ({ dateFormat: 'YYYY-MM-DD' }),
}));
vi.mock('$app/common/hooks/useGetCurrencySeparators', () => ({
  useGetCurrencySeparators: () => async () => ({}),
}));
vi.mock('$app/common/hooks/useNumericFormatter', () => ({
  useNumericFormatter: () => (value: string) => value,
}));
vi.mock('$app/common/hooks/useUserNumberPrecision', () => ({
  useUserNumberPrecision: () => 2,
}));
vi.mock('$app/pages/clients/common/hooks/useResolveDateAndTimeClientFormat', () => ({
  useResolveDateAndTimeClientFormat: () => async () => ({}),
}));

const task = (id: string, clientId = 'client-1') =>
  ({
    id,
    client_id: clientId,
    project_id: '',
    invoice_id: '',
    description: `Task ${id}`,
    time_log: JSON.stringify([[1700000000, 1700003600, '', true]]),
    rate: 100,
    custom_value1: '',
    custom_value2: '',
    custom_value3: '',
    custom_value4: '',
  }) as Task;

const latestInvoice = () => mocks.setInvoice.mock.lastCall![0] as Invoice;
const taskIds = (invoice: Invoice) => invoice.line_items.map(item => item.task_id);

describe('useInvoiceTask invoice isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.blank = { line_items: [] } as unknown as Invoice;
  });

  it('creates an invoice containing only the requested task', async () => {
    await useInvoiceTask()([task('A')]);

    expect(taskIds(latestInvoice())).toEqual(['A']);
    expect(latestInvoice().line_items[0]).toMatchObject({
      quantity: 1,
      cost: 100,
      line_total: 100,
    });
    expect(mocks.navigate).toHaveBeenCalledWith(
      '/invoices/create?table=tasks&project=false&action=invoice_task'
    );
  });

  it('does not modify the cached blank invoice', async () => {
    await useInvoiceTask()([task('A')]);

    expect(mocks.blank.line_items).toEqual([]);
  });

  it.each([
    ['single', ['A']],
    ['bulk', ['A', 'B']],
  ])('does not carry a previous %s selection into the next invoice', async (_, ids) => {
    await useInvoiceTask()(ids.map(id => task(id)));
    expect(taskIds(latestInvoice())).toEqual(ids);

    // A fresh hook instance simulates returning to the task list without reloading.
    await useInvoiceTask()([task('C')]);

    expect(taskIds(latestInvoice())).toEqual(['C']);
  });

  it('does not carry tasks from another client into a new invoice', async () => {
    await useInvoiceTask()([task('A', 'client-1')]);
    await useInvoiceTask()([task('B', 'client-2')]);

    expect(latestInvoice().client_id).toBe('client-2');
    expect(taskIds(latestInvoice())).toEqual(['B']);
    expect(mocks.error).not.toHaveBeenCalled();
  });

  it('still rejects an explicitly selected mixture of clients', async () => {
    await useInvoiceTask()([task('A', 'client-1'), task('B', 'client-2')]);

    expect(mocks.error).toHaveBeenCalledWith('multiple_client_error');
    expect(mocks.setInvoice).not.toHaveBeenCalled();
    expect(mocks.navigate).not.toHaveBeenCalled();
    expect(mocks.blank.line_items).toEqual([]);
  });
});
