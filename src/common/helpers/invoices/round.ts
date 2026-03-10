/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

/**
 * Rounds a number using "round half up" strategy, matching the Flutter app behavior.
 * This avoids the inconsistent rounding of Number.toFixed() across JS engines.
 *
 * For very large numbers where exponent shifting would exceed Number.MAX_SAFE_INTEGER,
 * falls back to parseFloat(toFixed()) since at that magnitude the fractional part
 * is already imprecise due to IEEE 754.
 */
export function roundToPrecision(
  value: number,
  precision: number = 2
): number {
  const isNegative = value < 0;

  if (isNegative) {
    value = -value;
  }

  const shifted = Number(value + `e+${precision}`);

  if (shifted > Number.MAX_SAFE_INTEGER) {
    value = parseFloat(value.toFixed(precision));
  } else {
    value = Number(Math.round(shifted) + `e-${precision}`);
  }

  if (isNegative) {
    value = -value;
  }

  return value;
}
