/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

type MaybeDefault<T> = T | { default: T };

export function unwrapDefault<T>(candidate: MaybeDefault<T>): T {
  if (candidate && 'default' in (candidate as object)) {
    return (candidate as { default: T }).default;
  }

  return candidate as T;
}
