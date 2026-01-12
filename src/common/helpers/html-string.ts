/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import DOMPurify from 'dompurify';

export function extractTextFromHTML(html: string) {
  return (
    new DOMParser().parseFromString(html, 'text/html').documentElement
      .textContent || ''
  );
}

interface SanitizeHTMLOptions {
  ALLOWED_TAGS?: string[];
  ALLOWED_ATTR?: string[];
  KEEP_CONTENT?: boolean;
  USE_PROFILES?: { html: boolean };
}

export function sanitizeHTML(html: string, options?: SanitizeHTMLOptions) {
  if (options) {
    return DOMPurify.sanitize(html, options);
  }

  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
  });
}
