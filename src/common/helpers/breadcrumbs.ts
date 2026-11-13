/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export const numberBreadcrumb = (
  number: string | null | undefined,
  fallback: string
) => {
  return number ? `#${number}` : fallback;
};

export const textBreadcrumb = (
  value: string | null | undefined,
  fallback: string,
  maxLength = 40
) => {
  const text = (value ?? '').replace(/\s+/g, ' ').trim();

  if (!text) {
    return fallback;
  }

  const characters = Array.from(text);

  if (characters.length <= maxLength) {
    return text;
  }

  return `${characters.slice(0, maxLength).join('').trimEnd()}…`;
};
