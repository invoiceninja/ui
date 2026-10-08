import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TaxDataModal } from '../../../src/pages/clients/show/components/TaxDataModal';

const mocks = vi.hoisted(() => ({
  company: { settings: { country_id: '276' }, calculate_taxes: true },
  request: vi.fn(),
  refetch: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => [(key: string) => key],
}));
vi.mock('react-redux', () => ({ useDispatch: () => vi.fn() }));
vi.mock('$app/common/colors', () => ({ useColorScheme: () => ({}) }));
vi.mock('$app/common/helpers', () => ({
  endpoint: (url: string, params: { id: string }) =>
    url.replace(':id', params.id),
}));
vi.mock('$app/common/helpers/request', () => ({ request: mocks.request }));
vi.mock('$app/common/helpers/toast/toast', () => ({
  toast: { processing: vi.fn(), success: mocks.success, error: mocks.error },
}));
vi.mock('$app/common/hooks/useCurrentCompany', () => ({
  useCurrentCompany: () => mocks.company,
}));
vi.mock('$app/common/hooks/useRefetch', () => ({
  useRefetch: () => mocks.refetch,
}));
vi.mock('$app/common/stores/slices/company-users', () => ({
  resetChanges: vi.fn(),
  updateRecord: vi.fn(),
}));
vi.mock('$app/components/forms', () => ({
  Button: ({ children, ...props }: any) =>
    createElement('button', props, children),
}));
vi.mock('$app/components/Modal', () => ({
  Modal: ({ visible, children }: any) =>
    visible ? createElement('section', {}, children) : null,
}));

const taxData = {
  geoPostalCode: '97201',
  geoCity: 'Portland',
  geoCounty: '',
  geoState: 'OR',
  taxSales: 0,
  taxUse: 0,
};
function open(props: Partial<Parameters<typeof TaxDataModal>[0]> = {}) {
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(
      createElement(TaxDataModal, {
        resourceId: 'client-id',
        resourceType: 'client',
        clientCountryId: '840',
        taxData,
        ...props,
      })
    );
  });
  act(() => renderer.root.findByType('button').props.onClick());
  return renderer;
}
describe('client tax refresh', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.company.settings.country_id = '276';
  });
  it('shows zero rates and refreshes populated data for US clients of non-US companies', async () => {
    mocks.request.mockResolvedValue({ data: { data: {} } });
    const renderer = open();
    expect(JSON.stringify(renderer.toJSON())).toContain('0 %');
    const refresh = renderer.root.findAllByType('button')[1];
    expect(refresh.props.children).toBe('update_tax_details');
    await act(async () => {
      refresh.props.onClick();
    });
    expect(mocks.request).toHaveBeenCalledWith(
      'POST',
      '/api/v1/clients/client-id/updateTaxData',
      undefined,
      { skipIntercept: true }
    );
    expect(mocks.refetch).toHaveBeenCalledWith(['clients']);
    expect(mocks.success).toHaveBeenCalled();
    act(() => renderer.unmount());
  });
  it.each([
    [0.07, '7 %'],
    [0.08875, '8.875 %'],
    [0.0725125, '7.25125 %'],
  ])('formats tax rate %s without floating-point artifacts', (rate, expected) => {
    const renderer = open({
      taxData: { ...taxData, taxSales: rate, taxUse: rate },
    });
    const displayedRates = renderer.root
      .findAllByType('span')
      .filter(
        (span) => span.children.length === 1 && span.children[0] === expected
      );
    expect(displayedRates).toHaveLength(2);
    act(() => renderer.unmount());
  });
  it('keeps the modal open and allows retry after a failed refresh', async () => {
    mocks.request.mockRejectedValue(new Error('Provider unavailable'));
    const renderer = open();
    await act(async () => {
      renderer.root.findAllByType('button')[1].props.onClick();
    });
    expect(mocks.error).toHaveBeenCalled();
    expect(mocks.success).not.toHaveBeenCalled();
    expect(renderer.root.findAllByType('button')[1].props.disabled).toBe(false);
    act(() => renderer.unmount());
  });
  it('keeps location tax details read-only when no refresh target exists', () => {
    mocks.company.settings.country_id = '840';
    const renderer = open({ resourceId: undefined, resourceType: undefined });
    expect(renderer.root.findAllByType('button')).toHaveLength(1);
    expect(JSON.stringify(renderer.toJSON())).toContain('0 %');
    act(() => renderer.unmount());
  });
  it('hides client tax details for non-US clients', () => {
    let renderer!: ReactTestRenderer;
    act(() => {
      renderer = create(
        createElement(TaxDataModal, {
          resourceId: 'client-id',
          resourceType: 'client',
          clientCountryId: '276',
          taxData,
        })
      );
    });
    expect(renderer.toJSON()).toBeNull();
    act(() => renderer.unmount());
  });
});
