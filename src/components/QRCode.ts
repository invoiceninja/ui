/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import QRCodeImport from 'react-qr-code';

type QRCodeComponent = typeof QRCodeImport;

const imported = QRCodeImport as unknown as
  | QRCodeComponent
  | { default: QRCodeComponent };

export function resolveQRCode(
  candidate: QRCodeComponent | { default: QRCodeComponent }
): QRCodeComponent {
  return 'default' in candidate ? candidate.default : candidate;
}

export const QRCode = resolveQRCode(imported);
