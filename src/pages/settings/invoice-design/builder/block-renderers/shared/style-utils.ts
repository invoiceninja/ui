/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

/** First defined wins; treats empty string as defined-but-blank → next falls back. */
export function pick<T>(...values: (T | undefined | null | '')[]): T {
  for (const v of values) {
    if (v !== undefined && v !== null && v !== '') return v as T;
  }
  return undefined as unknown as T;
}

/**
 * Append `px` to bare-number CSS lengths so user inputs like "8" don't get
 * silently dropped by the browser. Multi-token shorthands (e.g. "4px 8px") and
 * already-unitful values pass through unchanged.
 */
export function ensurePx(
  value: string | number | undefined | null
): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const s = String(value).trim();
  if (s === '') return undefined;
  // Multi-token shorthand: normalize each token independently.
  if (/\s/.test(s)) {
    return s
      .split(/\s+/)
      .map((t) => ensurePx(t) ?? t)
      .join(' ');
  }
  // Bare number (positive or negative, optional decimal) → append px.
  if (/^-?\d+(\.\d+)?$/.test(s)) return `${s}px`;
  return s;
}

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(text: unknown): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return String(text ?? '').replace(/[&<>"']/g, (match) => htmlEscapes[match]);
}
