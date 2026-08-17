import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import VerificationInputImport from 'react-verification-input';
import { describe, expect, test } from 'vitest';
import { VerificationInput } from '../../../src/components/VerificationInput';

describe('VerificationInput', () => {
  test('resolves the actual package component', () => {
    expect(VerificationInput).toBe(VerificationInputImport);
  });

  test('exports a renderable verification input', () => {
    let renderer!: ReactTestRenderer;

    act(() => {
      renderer = create(createElement(VerificationInput, { length: 4 }));
    });

    expect(
      renderer.root.findByProps({ 'aria-label': 'verification input' })
    ).toBeDefined();

    act(() => renderer.unmount());
  });
});
