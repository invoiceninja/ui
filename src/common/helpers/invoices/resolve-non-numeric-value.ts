/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ChangeEvent } from 'react';

export function isNonNumericValue(event: ChangeEvent<HTMLInputElement>) {
  if (isNaN(Number(event.target.value)) || event.target.value == '') {
    event.target.value = '0';

    return true;
  }

  return false;
}
