/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ModuleBitmask } from 'pages/settings/account-management/component';
import { GuardContext } from '../Guard';

export function enabled(module: ModuleBitmask) {
  return ({ company }: GuardContext) =>
    Boolean(company && company.enabled_modules & module);
}
