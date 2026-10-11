import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Client } from '../../../src/common/interfaces/client';
import { PeppolDiscovery } from '../../../src/pages/clients/edit/components/PeppolDiscovery';

const mocks = vi.hoisted(() => ({
  request: vi.fn(),
  isHosted: vi.fn(),
  company: {
    id: 'company',
    legal_entity_id: 123 as number | null | undefined,
    settings: { e_invoice_type: 'PEPPOL' },
  },
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => [(key: string) => key],
}));
vi.mock('$app/common/hooks/useCurrentCompany', () => ({
  useCurrentCompany: () => mocks.company,
}));
vi.mock('$app/common/helpers', () => ({
  isHosted: mocks.isHosted,
  endpoint: (url: string, params: { id: string }) =>
    url.replace(':id', params.id),
}));
vi.mock('$app/common/helpers/request', () => ({ request: mocks.request }));
vi.mock('$app/components/forms', () => ({
  Button: ({ children, ...props }: any) =>
    createElement('button', props, children),
}));
const client = { id: 'client-id', vat_number: 'BE123' } as Client;
function render() {
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(createElement(PeppolDiscovery, { client }));
  });
  return renderer;
}
describe('PEPPOL discovery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isHosted.mockReturnValue(true);
    mocks.company.legal_entity_id = 123;
    mocks.company.settings.e_invoice_type = 'PEPPOL';
  });
  it.each([
    [true, 'client_discoverable_on_peppol_network'],
    [false, 'client_not_found_on_peppol_network'],
    ['true', 'peppol_discovery_failed'],
    [undefined, 'peppol_discovery_failed'],
  ])('handles message %s without coercing it', async (message, expected) => {
    mocks.request.mockResolvedValue({ status: 200, data: { message } });
    const renderer = render();
    await act(async () => {
      await renderer.root.findByType('button').props.onClick();
    });
    expect(mocks.request).toHaveBeenCalledWith(
      'POST',
      '/api/v1/clients/client-id/peppol_discovery',
      undefined,
      expect.objectContaining({
        skipIntercept: true,
        signal: expect.any(AbortSignal),
      })
    );
    expect(renderer.root.findByProps({ role: 'status' }).children).toEqual([
      expected,
    ]);
    expect(renderer.root.findByType('button').props.disabled).toBe(false);
    act(() => renderer.unmount());
  });
  it('allows retry after HTTP errors', async () => {
    mocks.request
      .mockRejectedValueOnce(new Error('Unavailable'))
      .mockResolvedValueOnce({ status: 200, data: { message: true } });
    const renderer = render();
    await act(async () => {
      await renderer.root.findByType('button').props.onClick();
    });
    expect(renderer.root.findByProps({ role: 'status' }).children).toEqual([
      'peppol_discovery_failed',
    ]);
    await act(async () => {
      await renderer.root.findByType('button').props.onClick();
    });
    expect(renderer.root.findByProps({ role: 'status' }).children).toEqual([
      'client_discoverable_on_peppol_network',
    ]);
    act(() => renderer.unmount());
  });
  it('ignores an in-flight response after switching clients', async () => {
    let resolve!: (value: unknown) => void;
    mocks.request.mockReturnValue(
      new Promise((done) => {
        resolve = done;
      })
    );
    const renderer = render();
    act(() => {
      renderer.root.findByType('button').props.onClick();
    });
    expect(renderer.root.findByType('button').props.disabled).toBe(true);
    act(() => {
      renderer.update(
        createElement(PeppolDiscovery, { client: { ...client, id: 'other' } })
      );
    });
    await act(async () => {
      resolve({ status: 200, data: { message: true } });
    });
    expect(renderer.root.findByProps({ role: 'status' }).children).toEqual([]);
    act(() => renderer.unmount());
  });
  it('requires saving changed client identifiers before discovery', async () => {
    const renderer = render();
    act(() =>
      renderer.update(
        createElement(PeppolDiscovery, { client, requiresSave: true })
      )
    );
    expect(renderer.root.findByType('button').props.disabled).toBe(true);
    await act(async () => {
      await renderer.root.findByType('button').props.onClick();
    });
    expect(mocks.request).not.toHaveBeenCalled();
    expect(renderer.root.findByProps({ role: 'status' }).children).toEqual([
      'save_client_before_discovery',
    ]);
    act(() => renderer.unmount());
  });
  it('hides discovery on self-hosted accounts even with PEPPOL connected', () => {
    mocks.isHosted.mockReturnValue(false);
    const renderer = render();
    expect(renderer.toJSON()).toBeNull();
    expect(mocks.request).not.toHaveBeenCalled();
    act(() => renderer.unmount());
  });
  it.each([
    0,
    -1,
    null,
    undefined,
  ])('hides discovery without a positive legal entity ID (%s)', (id) => {
    mocks.company.legal_entity_id = id;
    const renderer = render();
    expect(renderer.toJSON()).toBeNull();
    expect(mocks.request).not.toHaveBeenCalled();
    act(() => renderer.unmount());
  });
  it('aborts an active discovery when PEPPOL is disconnected', async () => {
    let resolve!: (value: unknown) => void;
    mocks.request.mockReturnValue(
      new Promise((done) => {
        resolve = done;
      })
    );
    const renderer = render();
    act(() => {
      renderer.root.findByType('button').props.onClick();
    });
    mocks.company.legal_entity_id = 0;
    act(() => renderer.update(createElement(PeppolDiscovery, { client })));
    expect(mocks.request.mock.calls[0][3].signal.aborted).toBe(true);
    await act(async () => {
      resolve({ status: 200, data: { message: true } });
    });
    expect(renderer.toJSON()).toBeNull();
    act(() => renderer.unmount());
  });
  it('hides the button for accounts without PEPPOL', () => {
    mocks.company.settings.e_invoice_type = '';
    const renderer = render();
    expect(renderer.toJSON()).toBeNull();
    act(() => renderer.unmount());
  });
});
