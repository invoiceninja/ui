/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { sha256 } from 'js-sha256';

export function generate64CharHash() {
  const hash = sha256.create();
  hash.update(`${Date.now().toString()}${Math.random().toString()}`);

  return hash.hex();
}
