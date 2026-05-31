/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

// Captured before the OAuth params are stripped so Complete.tsx can read them
// inside its effect. We do the strip pre-React (in src/index.tsx) so secrets
// don't reach Sentry's pageload transaction, but we still need the params to
// fire the /complete POST.
export let capturedOAuthSearch: string | null = null;
export let capturedOAuthHash: string | null = null;

const OAUTH_KEYS = ['calendar_connection', 'provider', 'handoff', 'state', 'code'];

const COMPLETE_PATHNAME = '/calendar_connection/complete';
const COMPLETE_HASH_ROUTE = '#/calendar_connection/complete';

const hasOAuthParam = (qs: string): boolean => {
  if (!qs) return false;
  const params = new URLSearchParams(qs.startsWith('?') ? qs.slice(1) : qs);
  return OAUTH_KEYS.some((k) => params.has(k));
};

const stripOAuthKeys = (qs: string): string => {
  if (!qs) return '';
  const params = new URLSearchParams(qs.startsWith('?') ? qs.slice(1) : qs);
  OAUTH_KEYS.forEach((k) => params.delete(k));
  const next = params.toString();
  return next ? `?${next}` : '';
};

export function stripCalendarOAuthParamsFromLocation(): void {
  if (typeof window === 'undefined') return;

  const { pathname, search, hash } = window.location;

  const onBrowserCompletePath = pathname === COMPLETE_PATHNAME;
  const onHashCompletePath = hash.startsWith(COMPLETE_HASH_ROUTE);
  if (!onBrowserCompletePath && !onHashCompletePath) return;

  let nextSearch = search;
  let nextHash = hash;

  if (onBrowserCompletePath && hasOAuthParam(search)) {
    capturedOAuthSearch = search;
    nextSearch = stripOAuthKeys(search);
  }

  if (onHashCompletePath && hash.includes('?')) {
    const [pathPart, ...rest] = hash.split('?');
    const hashQuery = rest.join('?');
    if (hasOAuthParam(hashQuery)) {
      capturedOAuthHash = `?${hashQuery}`;
      nextHash = `${pathPart}${stripOAuthKeys(hashQuery)}`;
    }
  }

  if (nextSearch !== search || nextHash !== hash) {
    window.history.replaceState({}, '', `${pathname}${nextSearch}${nextHash}`);
  }
}
