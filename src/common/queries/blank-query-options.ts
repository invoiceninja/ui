/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2026. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import type { GenericQueryOptions } from './invoices';

/**
 * Resolve the `enabled` flag for blank-entity queries.
 *
 * GenericQueryOptions also carries legacy fields like `id` and `with` that must
 * never be spread into TanStack Query options.
 */
export function resolveBlankQueryEnabled(
  options: GenericQueryOptions | undefined,
  whenAllowed: boolean
): boolean {
  if (!whenAllowed) {
    return false;
  }

  return options?.enabled ?? true;
}
