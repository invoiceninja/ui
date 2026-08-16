/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import VerificationInputImport from 'react-verification-input';

type VerificationInputComponent = typeof VerificationInputImport;

const imported = VerificationInputImport as unknown as
  | VerificationInputComponent
  | { default: VerificationInputComponent };

export function resolveVerificationInput(
  candidate:
    | VerificationInputComponent
    | { default: VerificationInputComponent }
): VerificationInputComponent {
  return 'default' in candidate ? candidate.default : candidate;
}

export const VerificationInput = resolveVerificationInput(imported);
