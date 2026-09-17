/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export const toNumber = (raw: unknown): number => {
  const parsed = Number(String(raw ?? '').replace(',', '.'));

  return isNaN(parsed) ? 0 : parsed;
};
