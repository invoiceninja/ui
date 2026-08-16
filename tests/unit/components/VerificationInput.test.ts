import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import VerificationInputImport from 'react-verification-input';
import { describe, expect, test } from 'vitest';
import {
  resolveVerificationInput,
  VerificationInput,
} from '../../../src/components/VerificationInput';

describe('VerificationInput compatibility adapter', () => {
  test('preserves an already-unwrapped component', () => {
    expect(resolveVerificationInput(VerificationInputImport)).toBe(
      VerificationInputImport
    );
  });

  test('unwraps the nested default produced by Rolldown', () => {
    expect(resolveVerificationInput({ default: VerificationInputImport })).toBe(
      VerificationInputImport
    );
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
