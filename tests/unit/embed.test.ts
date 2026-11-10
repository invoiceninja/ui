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
  EMBED_PROTOCOL_VERSION,
  isEmbedded,
  openOutside,
  postToHost,
  readEmbedFlag,
  waitForHostInit,
} from '$app/common/helpers/embed';

class MemoryStorage {
  private items = new Map<string, string>();

  getItem(key: string) {
    return this.items.has(key) ? (this.items.get(key) as string) : null;
  }

  setItem(key: string, value: string) {
    this.items.set(key, String(value));
  }

  removeItem(key: string) {
    this.items.delete(key);
  }
}

let tab: MemoryStorage;
let shared: MemoryStorage;
let sent: string[];
let fakeWindow: {
  location: {
    search: string;
    hash: string;
    href: string;
    origin: string;
  };
  setTimeout: (fn: () => void, ms?: number) => number;
  clearTimeout: (id?: number) => void;
  InvoiceNinjaApp?: { postMessage: (m: string) => void };
  InvoiceNinjaEmbed?: Window['InvoiceNinjaEmbed'];
  open: ReturnType<typeof vi.fn>;
};

beforeEach(() => {
  tab = new MemoryStorage();
  shared = new MemoryStorage();
  sent = [];
  fakeWindow = {
    location: {
      search: '',
      hash: '',
      href: 'https://app.invoicing.co/#/docuninja/D1/builder',
      origin: 'https://app.invoicing.co',
    },
    setTimeout: (fn, ms) => setTimeout(fn, ms) as unknown as number,
    clearTimeout: (id) => clearTimeout(id as never),
    InvoiceNinjaApp: { postMessage: (m: string) => sent.push(m) },
    open: vi.fn(),
  };

  vi.stubGlobal('sessionStorage', tab);
  vi.stubGlobal('localStorage', shared);
  vi.stubGlobal('window', fakeWindow);
});

describe('embed', () => {
  test('?embed=1 in the hash fragment turns embed mode on for the tab', () => {
    fakeWindow.location.hash = '#/docuninja/D1/builder?company=C1&embed=1';

    expect(readEmbedFlag()).toBe(true);

    // In-app navigation drops the query; the tab stays embedded.
    fakeWindow.location.hash = '#/docuninja';
    expect(isEmbedded()).toBe(true);
  });

  test('without the flag nothing is sent to a host', () => {
    expect(readEmbedFlag()).toBe(false);

    postToHost('saved');

    expect(sent).toEqual([]);
  });

  test('the token the host hands over is for this tab only', async () => {
    fakeWindow.location.search = '?embed=1';
    readEmbedFlag();

    const ready = waitForHostInit();

    expect(JSON.parse(sent[0])).toEqual({
      v: EMBED_PROTOCOL_VERSION,
      type: 'ready',
      payload: {},
    });

    fakeWindow.InvoiceNinjaEmbed?.init?.({
      v: 1,
      token: 'company-token',
      nonce: 'n1',
    });

    // Every later message carries the host's nonce back.
    postToHost('saved');
    expect(JSON.parse(sent[1]).nonce).toBe('n1');
    await ready;

    expect(tab.getItem('X-NINJA-TOKEN')).toBe('company-token');
    expect(shared.getItem('X-NINJA-TOKEN')).toBeNull();
  });

  test('a page of this app opens in place, never as a new tab', () => {
    fakeWindow.location.search = '?embed=1';
    readEmbedFlag();

    openOutside('https://app.invoicing.co/#/docuninja/sign/D1/I1');

    expect(fakeWindow.open).not.toHaveBeenCalled();
    expect(fakeWindow.location.href).toBe(
      'https://app.invoicing.co/#/docuninja/sign/D1/I1'
    );
    expect(sent).toEqual([]);
  });

  test('another site opens in the host app', () => {
    fakeWindow.location.search = '?embed=1';
    readEmbedFlag();

    openOutside('https://docuninja.co/help');

    expect(fakeWindow.open).not.toHaveBeenCalled();
    expect(JSON.parse(sent[0])).toMatchObject({
      type: 'openExternal',
      payload: { url: 'https://docuninja.co/help' },
    });
  });

  test('?embed=1 in a plain browser tab is ignored', () => {
    delete fakeWindow.InvoiceNinjaApp;
    fakeWindow.location.search = '?embed=1';

    expect(readEmbedFlag()).toBe(false);
    expect(isEmbedded()).toBe(false);
  });

  test('a host that never answers lets the page boot', async () => {
    vi.useFakeTimers();
    fakeWindow.location.search = '?embed=1';
    readEmbedFlag();

    let booted = false;
    void waitForHostInit().then(() => {
      booted = true;
    });

    await vi.advanceTimersByTimeAsync(15_000);
    expect(booted).toBe(true);
    vi.useRealTimers();
  });

  test('outside embed mode a link opens a new tab', () => {
    openOutside('https://example.com');

    expect(fakeWindow.open).toHaveBeenCalledWith(
      'https://example.com',
      '_blank'
    );
  });
});
