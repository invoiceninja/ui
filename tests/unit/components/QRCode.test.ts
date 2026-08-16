import { createElement } from 'react';
import QRCodeImport from 'react-qr-code';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { describe, expect, test } from 'vitest';
import { QRCode, resolveQRCode } from '../../../src/components/QRCode';

describe('QRCode compatibility adapter', () => {
  test('preserves an already-unwrapped component', () => {
    expect(resolveQRCode(QRCodeImport)).toBe(QRCodeImport);
  });

  test('unwraps the nested default produced by Rolldown', () => {
    expect(resolveQRCode({ default: QRCodeImport })).toBe(QRCodeImport);
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
