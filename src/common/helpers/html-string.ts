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

/** Flatten WYSIWYG fields (terms, footer, signatures) for canvas preview. */
export function htmlToPlainText(html: string) {
  if (typeof html !== 'string' || html.trim() === '') {
    return '';
  }

  if (!/<\/?[a-z][\s\S]*>/i.test(html)) {
    return html;
  }

  const withBreaks = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, '\n');

  return extractTextFromHTML(withBreaks).replace(/\n{3,}/g, '\n\n').trim();
}

interface SanitizeHTMLOptions {
  ALLOWED_TAGS?: string[];
  ALLOWED_ATTR?: string[];
  ADD_TAGS?: string[];
  ADD_ATTR?: string[];
  FORBID_TAGS?: string[];
  FORBID_ATTR?: string[];
  KEEP_CONTENT?: boolean;
  USE_PROFILES?: { html: boolean };
  WHOLE_DOCUMENT?: boolean;
}

export function sanitizeHTML(html: string, options?: SanitizeHTMLOptions) {
  if (options) {
    return DOMPurify.sanitize(html, options);
  }

  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
  });
}
