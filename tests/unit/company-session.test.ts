/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2026. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  clearTabCompany,
  currentIndexValue,
  currentToken,
  getCompanyItem,
  hasTabCompany,
  removeCompanyItem,
  setCompanyItem,
  setTabCompany,
} from '$app/common/helpers/company-session';

class MemoryStorage {
  private items = new Map<string, string>();

  get length() {
    return this.items.size;
  }

  clear() {
    this.items.clear();
  }

  getItem(key: string) {
    return this.items.has(key) ? (this.items.get(key) as string) : null;
  }

  key(index: number) {
    return Array.from(this.items.keys())[index] ?? null;
  }

  removeItem(key: string) {
    this.items.delete(key);
  }

  setItem(key: string, value: string) {
    this.items.set(key, String(value));
  }
}

// Stands in for the company every tab shares.
let shared: MemoryStorage;
// Stands in for this one tab.
let tab: MemoryStorage;

beforeEach(() => {
  shared = new MemoryStorage();
  tab = new MemoryStorage();

  vi.stubGlobal('localStorage', shared);
  vi.stubGlobal('sessionStorage', tab);

  shared.setItem('X-NINJA-TOKEN', 'token-a');
  shared.setItem('X-CURRENT-INDEX', '0');
});

describe('company-session', () => {
  test('without a tab company, the shared company is used', () => {
    expect(hasTabCompany()).toBe(false);
    expect(currentToken()).toBe('token-a');
    expect(currentIndexValue()).toBe('0');
  });

  test('a tab company wins over the shared one, and leaves it untouched', () => {
    setTabCompany(2, 'token-c');

    expect(hasTabCompany()).toBe(true);
    expect(currentToken()).toBe('token-c');
    expect(currentIndexValue()).toBe('2');

    // What every other tab still reads.
    expect(shared.getItem('X-NINJA-TOKEN')).toBe('token-a');
    expect(shared.getItem('X-CURRENT-INDEX')).toBe('0');
  });

  test('writes go to the tab while it has its own company', () => {
    setTabCompany(2, 'token-c');

    // e.g. the `authenticate` reducer storing the token it was handed.
    setCompanyItem('X-NINJA-TOKEN', 'token-c2');

    expect(tab.getItem('X-NINJA-TOKEN')).toBe('token-c2');
    expect(shared.getItem('X-NINJA-TOKEN')).toBe('token-a');
  });

  test('writes go to the shared company otherwise', () => {
    setCompanyItem('X-NINJA-TOKEN', 'token-b');

    expect(shared.getItem('X-NINJA-TOKEN')).toBe('token-b');
    expect(tab.getItem('X-NINJA-TOKEN')).toBeNull();
  });

  test('clearing the tab company falls back to the shared one', () => {
    setTabCompany(2, 'token-c');
    clearTabCompany();

    expect(hasTabCompany()).toBe(false);
    expect(currentToken()).toBe('token-a');
    expect(currentIndexValue()).toBe('0');
  });

  test('removing an item only touches the store in use', () => {
    setTabCompany(2, 'token-c');
    removeCompanyItem('X-CURRENT-INDEX');

    expect(getCompanyItem('X-CURRENT-INDEX')).toBeNull();
    expect(shared.getItem('X-CURRENT-INDEX')).toBe('0');
  });
});
