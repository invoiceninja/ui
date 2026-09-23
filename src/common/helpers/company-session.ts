/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2026. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

/**
 * The active company is normally shared by every tab: its token and index
 * live in localStorage, and `defaultHeaders()` reads the token on every
 * request. A tab opened from a `?company=` link must not move the other tabs
 * with it — they would keep their company's UI while their next request went
 * out with the linked company's token.
 *
 * So a link that picks a different company stores it in sessionStorage
 * instead, which belongs to that one tab. While the override is set, every
 * per-company key is read from and written to sessionStorage; an explicit
 * company switch, a new company or a logout clears it.
 */

const TOKEN = 'X-NINJA-TOKEN';
const INDEX = 'X-CURRENT-INDEX';

/** Keys whose value belongs to one company, and so to the tab's company. */
const COMPANY_KEYS = [TOKEN, INDEX];

export function hasTabCompany(): boolean {
  return sessionStorage.getItem(TOKEN) !== null;
}

function store(): Storage {
  return hasTabCompany() ? sessionStorage : localStorage;
}

export function getCompanyItem(key: string): string | null {
  return store().getItem(key);
}

export function setCompanyItem(key: string, value: string): void {
  store().setItem(key, value);
}

export function removeCompanyItem(key: string): void {
  store().removeItem(key);
}

export function currentToken(): string | null {
  return getCompanyItem(TOKEN);
}

export function currentIndexValue(): string | null {
  return getCompanyItem(INDEX);
}

/** Pins this tab to a company without touching the other tabs. */
export function setTabCompany(index: number, token: string): void {
  sessionStorage.setItem(INDEX, index.toString());
  sessionStorage.setItem(TOKEN, token);
}

/** Returns this tab to the company shared by every tab. */
export function clearTabCompany(): void {
  COMPANY_KEYS.forEach((key) => sessionStorage.removeItem(key));
}
