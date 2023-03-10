/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { CreditResolver } from '$app/common/helpers/credits/credit-resolver';

const creditResolver = new CreditResolver();

export function useCreditResolver() {
  return creditResolver;
}
