/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { GuardContext, SyncGuardFunction } from '../Guard';

export function and(...guards: SyncGuardFunction[]) {
  return (ctx: GuardContext) => {
    const results: boolean[] = [];

    guards.map((guard) => results.push(guard()(ctx)));

    const unique = [...new Set(results)];

    if (unique.filter((v) => v === true).length === 1) {
      return true;
    }

    return false;
  };
}
