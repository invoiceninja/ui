import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import type { ReactSettings } from '$app/common/hooks/useReactSettings';

const mocks = vi.hoisted(() => ({
  settings: {} as Partial<ReactSettings>,
  save: vi.fn(),
  update: vi.fn(),
  storeSession: vi.fn(),
  storeScoped: vi.fn(),
}));

vi.mock('$app/common/hooks/useCurrentUser', () => ({
  useCurrentUser: () => ({ id: 'user-id' }),
}));

vi.mock('$app/common/hooks/useReactSettings', async () => {
  const { atom } = await import('jotai');
  return {
    reactSettingsAtom: atom({}),
    useReactSettings: () => mocks.settings,
    useSaveReactSettings: () => mocks.save,
    useUpdateReactSettings: () => mocks.update,
  };
});

vi.mock('$app/common/hooks/useStoreSessionTableFilters', () => ({
  useStoreSessionTableFilters: () => mocks.storeSession,
}));

vi.mock('$app/common/hooks/useDataTablePreference', () => ({
  useDataTablePreference:
    ({ tableKey }: { tableKey: string }) =>
    (key: string) => {
      const saved = mocks.settings.table_filters?.[tableKey];
      return saved?.[key as keyof typeof saved] ?? '';
    },
}));

vi.mock('$app/common/hooks/useScopedTableFilters', () => ({
  useScopedTableFilters: () => ({ storeFilters: mocks.storeScoped }),
}));

import { useDataTablePreferences } from '$app/common/hooks/useDataTablePreferences';

type Params = Parameters<typeof useDataTablePreferences>[0];
let renderer: ReactTestRenderer | undefined;

function mount(overrides: Partial<Params> = {}) {
  const params: Params = {
    apiEndpoint: new URL('https://example.test/api/v1/invoices?sort=id|asc'),
    tableKey: 'invoices',
    isInitialConfiguration: false,
    customFilter: undefined,
    setFilter: vi.fn(),
    setCustomFilter: vi.fn(),
    setCurrentPage: vi.fn(),
    setSort: vi.fn(),
    setSortedBy: vi.fn(),
    setStatus: vi.fn(),
    setPerPage: vi.fn(),
    setArePreferencesApplied: vi.fn(),
    withoutStoringPerPage: false,
    enableSavingFilterPreference: true,
    ...overrides,
  };
  let result!: ReturnType<typeof useDataTablePreferences>;
  function Harness() {
    result = useDataTablePreferences(params);
    return null;
  }
  act(() => {
    renderer = create(createElement(Harness));
  });
  return { params, save: result.handleUpdateTableFilters };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.settings = { persist_table_filters: true };
});

afterEach(() => {
  act(() => renderer?.unmount());
  renderer = undefined;
});

test.each([
  ['sort', 'due_date', 'due_date|desc', ['active'], '10'],
  ['lifecycle', undefined, 'id|asc', ['archived'], '10'],
  ['page size', undefined, 'id|asc', ['active'], '50'],
] as const)('saves %s without a custom filter', (_name, sortedBy, sort, status, perPage) => {
  const { save } = mount();
  act(() => save('', sortedBy, sort, 1, [...status], perPage));
  expect(mocks.save).toHaveBeenCalledExactlyOnceWith('table_filters.invoices', {
    ...(sortedBy && { sortedBy }),
    sort,
    status: [...status],
    perPage,
  });
});

test.each([
  { customFilter: ['paid'], expected: ['paid'] },
  { customFilter: [], expected: ['unpaid'] },
  { customFilter: undefined, expected: ['unpaid'] },
])('preserves custom-filter payload and defaults: $customFilter', ({
  customFilter,
  expected,
}) => {
  const { save } = mount({
    customFilter,
    customFilters: ['paid', 'unpaid'].map((value) => ({
      value,
      label: value,
      color: '',
      backgroundColor: '',
    })),
    defaultCustomFilterValues: ['unpaid'],
  });
  act(() => save('', 'due_date', 'due_date|desc', 1, ['active'], '10'));
  expect(mocks.save).toHaveBeenCalledExactlyOnceWith('table_filters.invoices', {
    sortedBy: 'due_date',
    sort: 'due_date|desc',
    status: ['active'],
    perPage: '10',
    customFilter: expected,
  });
});

test('restores existing preferences and skips an unchanged save', () => {
  mocks.settings.table_filters = {
    invoices: {
      sortedBy: 'due_date',
      sort: 'due_date|desc',
      status: ['archived'],
      perPage: '50',
    },
  };
  const { params, save } = mount();
  expect(params.setSort).toHaveBeenCalledWith('due_date|desc');
  expect(params.setSortedBy).toHaveBeenCalledWith('due_date');
  expect(params.setStatus).toHaveBeenCalledWith(['archived']);
  expect(params.setPerPage).toHaveBeenCalledWith('50');
  act(() => save('', 'due_date', 'due_date|desc', 1, ['archived'], '50'));
  expect(mocks.save).not.toHaveBeenCalled();
});

test.each([
  { withoutStoringPreferences: true },
  { enableSavingFilterPreference: false },
  { tableKey: undefined },
])('respects existing save gates: %j', (overrides) => {
  const { save } = mount(overrides);
  act(() => save('', 'due_date', 'due_date|desc', 1, ['active'], '10'));
  expect(mocks.save).not.toHaveBeenCalled();
});

test('retains session storage when server persistence is disabled', () => {
  mocks.settings.persist_table_filters = false;
  const { save } = mount();
  act(() => save('search', 'due_date', 'due_date|desc', 2, ['active'], '10'));
  expect(mocks.storeSession).toHaveBeenCalledWith('search', 2, undefined);
  expect(mocks.save).not.toHaveBeenCalled();
});

test('stores record-scoped state without saving server preferences', () => {
  const { save } = mount({ withRecordScopedFilters: true });
  act(() => save('search', 'due_date', 'due_date|desc', 2, ['active'], '10'));
  expect(mocks.storeScoped).toHaveBeenCalledExactlyOnceWith({
    filter: 'search',
    customFilter: undefined,
    sortedBy: 'due_date',
    sort: 'due_date|desc',
    currentPage: 2,
    status: ['active'],
    perPage: '10',
  });
  expect(mocks.storeSession).not.toHaveBeenCalled();
  expect(mocks.save).not.toHaveBeenCalled();
});
