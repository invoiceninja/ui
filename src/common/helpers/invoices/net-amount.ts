/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2026. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

interface NetAmountResource {
  amount: number;
  total_taxes: number;
}

export function calculateNetAmount(
  resource: Partial<NetAmountResource> | undefined | null
): number {
  return Number(resource?.amount || 0) - Number(resource?.total_taxes || 0);
}
