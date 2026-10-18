import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Client } from '../../../src/common/interfaces/client';
import { VatValidation } from '../../../src/pages/clients/edit/components/VatValidation';

const mocks = vi.hoisted(() => ({
  request: vi.fn(),
  onValidated: vi.fn(),
  company: { id: 'company', settings: { e_invoice_type: 'PEPPOL' } },
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => [(key: string) => key],
}));
vi.mock('$app/common/hooks/useCurrentCompany', () => ({
  useCurrentCompany: () => mocks.company,
}));
vi.mock('$app/common/helpers', () => ({
  endpoint: (url: string, params: { id: string }) =>
    url.replace(':id', params.id),
}));
vi.mock('$app/common/helpers/request', () => ({ request: mocks.request }));
vi.mock('$app/components/forms', () => ({
  Button: ({ children, ...props }: any) =>
    createElement('button', props, children),
}));
const client = {
  id: 'client-id',
  vat_number: 'BE123',
  country_id: '56',
} as Client;
function render() {
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(
      createElement(VatValidation, { client, onValidated: mocks.onValidated })
    );
  });
  return renderer;
}
describe('VAT validation', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
    mocks.company.settings.e_invoice_type = 'PEPPOL';
  });
  afterEach(() => vi.useRealTimers());
  const advance = async (ms: number) => {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(ms);
    });
  };
  const start = async (renderer: ReactTestRenderer) => {
    await act(async () => {
      await renderer.root.findByType('button').props.onClick();
    });
  };
  it.each([
    'valid',
    'invalid',
    'unavailable',
  ])('polls pending then stops on %s', async (status) => {
    mocks.request
      .mockResolvedValueOnce({ status: 200, data: {} })
      .mockResolvedValueOnce({ status: 200, data: { message: 'pending' } })
      .mockResolvedValueOnce({ status: 200, data: { message: status } });
    const renderer = render();
    await start(renderer);
    expect(mocks.request).toHaveBeenCalledTimes(1);
    expect(renderer.root.findByProps({ role: 'status' }).children).toEqual([
      'vat_validation_pending',
    ]);
    await advance(1999);
    expect(mocks.request).toHaveBeenCalledTimes(1);
    await advance(1);
    expect(mocks.request).toHaveBeenLastCalledWith(
      'GET',
      '/api/v1/clients/client-id/vat_status',
      undefined,
      expect.objectContaining({
        skipIntercept: true,
        signal: expect.any(AbortSignal),
      })
    );
    await advance(2000);
    expect(renderer.root.findByProps({ role: 'status' }).children).toEqual([
      'vat_validation_' + status,
    ]);
    if (status === 'unavailable')
      expect(mocks.onValidated).not.toHaveBeenCalled();
    else expect(mocks.onValidated).toHaveBeenCalledWith(status === 'valid');
    expect(renderer.root.findByType('button').props.disabled).toBe(false);
    await advance(30000);
    expect(mocks.request).toHaveBeenCalledTimes(3);
    act(() => renderer.unmount());
  });
  it('times out after 30 seconds of pending results and permits retry', async () => {
    mocks.request.mockResolvedValue({
      status: 200,
      data: { message: 'pending' },
    });
    const renderer = render();
    await start(renderer);
    await advance(29999);
    expect(renderer.root.findByType('button').props.disabled).toBe(true);
    await advance(1);
    expect(renderer.root.findByProps({ role: 'status' }).children).toEqual([
      'vat_validation_timeout',
    ]);
    expect(mocks.onValidated).not.toHaveBeenCalled();
    const count = mocks.request.mock.calls.length;
    await advance(10000);
    expect(mocks.request).toHaveBeenCalledTimes(count);
    await start(renderer);
    expect(renderer.root.findByType('button').props.disabled).toBe(true);
    act(() => renderer.unmount());
    expect(vi.getTimerCount()).toBe(0);
  });
  it('does not overlap slow polls and aborts them at the deadline', async () => {
    let resolve!: (value: unknown) => void;
    mocks.request.mockResolvedValueOnce({ status: 200 }).mockReturnValueOnce(
      new Promise((done) => {
        resolve = done;
      })
    );
    const renderer = render();
    await start(renderer);
    await advance(30000);
    expect(mocks.request).toHaveBeenCalledTimes(2);
    expect(mocks.request.mock.calls[1][3].signal.aborted).toBe(true);
    await act(async () => {
      resolve({ status: 200, data: { message: 'valid' } });
    });
    expect(mocks.onValidated).not.toHaveBeenCalled();
    expect(renderer.root.findByProps({ role: 'status' }).children).toEqual([
      'vat_validation_timeout',
    ]);
    act(() => renderer.unmount());
  });
  it.each([
    new Error('Offline'),
    { status: 200, data: { message: 'unknown' } },
    { status: 200, data: 'pending' },
    { status: 200, data: { status: 'pending' } },
  ])('handles polling failures without changing validity', async (response) => {
    mocks.request.mockResolvedValueOnce({ status: 200 });
    if (response instanceof Error)
      mocks.request.mockRejectedValueOnce(response);
    else mocks.request.mockResolvedValueOnce(response);
    const renderer = render();
    await start(renderer);
    await advance(2000);
    expect(renderer.root.findByProps({ role: 'status' }).children).toEqual([
      'vat_validation_failed',
    ]);
    expect(mocks.onValidated).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
    act(() => renderer.unmount());
  });
  it('does not poll if initiating validation fails', async () => {
    mocks.request.mockRejectedValueOnce(new Error('Offline'));
    const renderer = render();
    await start(renderer);
    await advance(30000);
    expect(mocks.request).toHaveBeenCalledTimes(1);
    expect(mocks.onValidated).not.toHaveBeenCalled();
    act(() => renderer.unmount());
  });
  it('cancels polling when the VAT number changes', async () => {
    mocks.request.mockResolvedValue({
      status: 200,
      data: { message: 'pending' },
    });
    const renderer = render();
    await start(renderer);
    await advance(2000);
    act(() =>
      renderer.update(
        createElement(VatValidation, {
          client: { ...client, vat_number: 'BE456' },
          onValidated: mocks.onValidated,
        })
      )
    );
    await advance(30000);
    expect(mocks.request).toHaveBeenCalledTimes(2);
    expect(renderer.root.findByProps({ role: 'status' }).children).toEqual([]);
    expect(mocks.onValidated).not.toHaveBeenCalled();
    act(() => renderer.unmount());
  });
  it('requires saving changed client identifiers before validation', async () => {
    const renderer = render();
    act(() =>
      renderer.update(
        createElement(VatValidation, {
          client,
          requiresSave: true,
          onValidated: mocks.onValidated,
        })
      )
    );
    expect(renderer.root.findByType('button').props.disabled).toBe(true);
    await act(async () => {
      await renderer.root.findByType('button').props.onClick();
    });
    expect(mocks.request).not.toHaveBeenCalled();
    expect(renderer.root.findByProps({ role: 'status' }).children).toEqual([
      'save_client_before_vat_check',
    ]);
    act(() => renderer.unmount());
  });
  it('hides the button for non-EU clients including EEA-only countries', () => {
    const renderer = render();
    act(() =>
      renderer.update(
        createElement(VatValidation, {
          client: { ...client, country_id: '578' },
          onValidated: mocks.onValidated,
        })
      )
    );
    expect(renderer.toJSON()).toBeNull();
    act(() => renderer.unmount());
  });
  it('disables checks without a VAT number', async () => {
    const renderer = render();
    act(() =>
      renderer.update(
        createElement(VatValidation, {
          client: { ...client, vat_number: '' },
          onValidated: mocks.onValidated,
        })
      )
    );
    expect(renderer.root.findByType('button').props.disabled).toBe(true);
    await act(async () => {
      await renderer.root.findByType('button').props.onClick();
    });
    expect(mocks.request).not.toHaveBeenCalled();
    act(() => renderer.unmount());
  });
});
