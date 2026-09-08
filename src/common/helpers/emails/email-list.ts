/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export const EMAIL_LIST_DELIMITER_PATTERN = '[\\s,;]';

const EMAIL_LIST_SEPARATOR = ',';

const delimiters = new RegExp(`${EMAIL_LIST_DELIMITER_PATTERN}+`);

export function parseEmailList(value?: string | null): string[] {
  if (!value) {
    return [];
  }

  const seen = new Set<string>();

  return value
    .split(delimiters)
    .map((email) => email.trim())
    .filter((email) => {
      if (!email || seen.has(email.toLowerCase())) {
        return false;
      }

      seen.add(email.toLowerCase());

      return true;
    });
}

export function joinEmailList(emails: string[]): string {
  return emails.join(EMAIL_LIST_SEPARATOR);
}

export function limitEmailList(emails: string[], limit?: number): string[] {
  if (!limit || emails.length <= limit) {
    return emails;
  }

  return emails.slice(0, limit);
}
