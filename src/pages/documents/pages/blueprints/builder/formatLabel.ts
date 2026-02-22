/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export function formatLabel(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  email: string | null | undefined,
  fallback: string
): string {
  const first = firstName || '';
  const last = lastName || '';
  const emailAddr = email || '';
  const name = [first, last].filter(Boolean).join(' ').trim();

  if (name) {
    return name;
  }

  if (emailAddr) {
    return emailAddr;
  }

  return fallback;
}
