import { createElement } from 'react';
import AppleSigninImport from 'react-apple-signin-auth';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { describe, expect, test } from 'vitest';
import { AppleSignin } from '../../../src/components/AppleSignin';

describe('AppleSignin', () => {
  test('resolves the actual package component', () => {
    expect(AppleSignin).toBe(AppleSigninImport);
  });

  test('exports a renderable Apple sign-in button', () => {
    let renderer!: ReactTestRenderer;

    act(() => {
      renderer = create(
        createElement(AppleSignin, {
          authOptions: {
            clientId: 'com.invoiceninja.client',
            redirectURI: 'https://invoicing.co/auth/apple',
            scope: 'email name',
          },
          onError: () => undefined,
          onSuccess: () => undefined,
          skipScript: true,
          uiType: 'dark',
        })
      );
    });

    expect(
      renderer.root.findByProps({ 'aria-label': 'Signin with apple ID' })
    ).toBeDefined();

    act(() => renderer.unmount());
  });
});
