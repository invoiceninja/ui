import { createElement } from 'react';
import QRCodeImport from 'react-qr-code';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { describe, expect, test } from 'vitest';
import { QRCode } from '../../../src/components/QRCode';

describe('QRCode', () => {
  test('resolves the actual package component', () => {
    expect(QRCode).toBe(QRCodeImport);
  });

  test('exports a renderable QR code', () => {
    let renderer!: ReactTestRenderer;

    act(() => {
      renderer = create(
        createElement(QRCode, {
          'aria-label': 'Two-factor QR code',
          value: 'otpauth://totp/InvoiceNinja:test',
        })
      );
    });

    expect(
      renderer.root.findByProps({ 'aria-label': 'Two-factor QR code' })
    ).toBeDefined();

    act(() => renderer.unmount());
  });
});
