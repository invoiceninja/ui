/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { DocuNinjaGuard, DocuNinjaContext } from '../../DocuNinjaGuard';

export function docuNinjaOr(...guards: DocuNinjaGuard[]): DocuNinjaGuard {
  return async (ctx: DocuNinjaContext) =>
    // eslint-disable-next-line no-async-promise-executor
    new Promise(async (resolve) => {
      for (const guard of guards) {
        const value = await guard(ctx);

        if (value === true) {
          resolve(true);
          break;
        }
      }

      resolve(false);
    });
}

export function docuNinjaAnd(...guards: DocuNinjaGuard[]): DocuNinjaGuard {
  return async (ctx: DocuNinjaContext) => {
    const results = await Promise.all(guards.map(guard => guard(ctx)));
    return results.every(result => result === true);
  };
}

export function docuNinjaNot(guard: DocuNinjaGuard): DocuNinjaGuard {
  return async (ctx: DocuNinjaContext) => {
    const result = await guard(ctx);
    return !result;
  };
}
