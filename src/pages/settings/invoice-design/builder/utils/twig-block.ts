/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { sanitizeHTML } from '$app/common/helpers/html-string';

/** Single outer `<ninja>…</ninja>` wrapper. Inner source is left intact. */
const NINJA_WRAPPER = /^\s*<ninja\b[^>]*>([\s\S]*)<\/ninja>\s*$/i;

/**
 * Persist / emit the inner Twig only. Users may paste a full `<ninja>` block;
 * wrapping again would nest tags and break `PdfBuilder::parseTwigElements()`.
 */
export function unwrapNinjaTags(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }

  const match = value.match(NINJA_WRAPPER);

  return match ? match[1] : value;
}

/**
 * Sketch Twig/HTML inside the widget. Twig tags stay as text; real markup
 * (tables, divs) must render in-place so preview matches the widget box.
 */
export function twigSourceToPreviewHtml(value: unknown): string {
  const source = unwrapNinjaTags(value);

  if (!source.trim()) {
    return '';
  }

  if (typeof window === 'undefined') {
    return source;
  }

  return sanitizeHTML(source, {
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'link', 'base', 'form'],
  });
}
