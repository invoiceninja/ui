/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import AppleSigninImport from 'react-apple-signin-auth';

type AppleSigninComponent = typeof AppleSigninImport;

const imported = AppleSigninImport as unknown as
  | AppleSigninComponent
  | { default: AppleSigninComponent };

export function resolveAppleSignin(
  candidate: AppleSigninComponent | { default: AppleSigninComponent }
): AppleSigninComponent {
  return 'default' in candidate ? candidate.default : candidate;
}

export const AppleSignin = resolveAppleSignin(imported);
