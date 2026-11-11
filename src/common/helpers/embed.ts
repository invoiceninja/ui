/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2026. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { setTabToken } from '$app/common/helpers/company-session';

/**
 * Embed mode: the Invoice Ninja mobile and desktop apps show a page of this
 * app (today the DocuNinja field builder) inside a web view, opened with
 * `?embed=1`.
 *
 * - The page renders without the sidebar and top navigation (`Default`).
 * - It signs in with a token the host app hands over once the page asks for
 *   it (`waitForHostInit`), kept in `sessionStorage` for this tab only, so it
 *   never reaches the URL, the browser's other tabs or a later session.
 * - It reports what happens (saved, sent, ...) to the host app
 *   (`postToHost`) through the `InvoiceNinjaApp` channel the web view adds.
 *
 * Messages are JSON: `{ v, type, payload, nonce }`. `v` is
 * `EMBED_PROTOCOL_VERSION`; the host checks it on `ready`. `nonce` is the
 * one the host handed over in `init`, on every message after `ready`.
 */

const EMBED = 'X-EMBED';

/**
 * Bumped only on a breaking change to the messages: the host drives only
 * the version it knows, and sends the user to the browser otherwise.
 */
export const EMBED_PROTOCOL_VERSION = 1;

export interface EmbedInit {
  v: number;
  /**
   * A per-page secret the host made: every message after `ready` carries
   * it back, so a message from any other frame on the page is ignored.
   */
  nonce: string;
  /** The Invoice Ninja company token, for this tab only. */
  token: string;
}

interface HostChannel {
  postMessage: (message: string) => void;
}

declare global {
  interface Window {
    /** Added by the host app's web view (a JavaScript channel). */
    InvoiceNinjaApp?: HostChannel;
    /** Called by the host app once the page reported `ready`. */
    InvoiceNinjaEmbed?: {
      init?: (config: EmbedInit) => void;
    };
  }
}

/**
 * Reads `?embed=1` (from the search, or from the fragment under the hash
 * router) once, and remembers it for the tab, so it survives in-app
 * navigation that drops the query.
 */
export function readEmbedFlag(): boolean {
  // Only inside the host app's web view, which adds its channel before the
  // page runs: `?embed=1` typed or pasted into a browser tab must not strand
  // it waiting for a host that is not there.
  if (!window.InvoiceNinjaApp) {
    return false;
  }

  const query = [
    window.location.search,
    window.location.hash.split('?')[1] ?? '',
  ].join('&');

  if (new URLSearchParams(query).get('embed') === '1') {
    sessionStorage.setItem(EMBED, '1');
  }

  return isEmbedded();
}

export function isEmbedded(): boolean {
  // Storage can be missing (tests, server rendering) or throw (a browser
  // that blocks it): neither is an embed.
  try {
    return (
      typeof sessionStorage !== 'undefined' &&
      sessionStorage.getItem(EMBED) === '1'
    );
  } catch {
    return false;
  }
}

/** The host's secret for this page, once `init` handed it over. */
let hostNonce: string | null = null;

/** What the page tells the host app. */
export type EmbedMessageType =
  | 'ready'
  | 'loaded'
  | 'dirty'
  | 'saved'
  | 'saveError'
  | 'sent'
  | 'sendError'
  | 'documentUpdated'
  | 'mapSignatoriesSent'
  | 'signed'
  | 'error'
  | 'openExternal';

/** Tells the host app something happened. A no-op outside embed mode. */
export function postToHost(type: EmbedMessageType, payload: object = {}): void {
  if (!isEmbedded()) {
    return;
  }

  window.InvoiceNinjaApp?.postMessage(
    JSON.stringify({
      v: EMBED_PROTOCOL_VERSION,
      type,
      payload,
      ...(hostNonce ? { nonce: hostNonce } : {}),
    })
  );
}

/** How long a boot waits for the host before going on without it. */
const HOST_INIT_TIMEOUT_MS = 15_000;

/**
 * Asks the host app for the token and waits for it before the app boots, so
 * the first request is already signed in. The token is stored the way a
 * tab opened on another company stores it (`company-session.ts`).
 *
 * Every boot asks, a reload included (after an update, say); a host that
 * never answers lets the page boot after `HOST_INIT_TIMEOUT_MS`, signed
 * out, rather than stay blank.
 */
export function waitForHostInit(): Promise<void> {
  return new Promise((resolve) => {
    const timeout = window.setTimeout(resolve, HOST_INIT_TIMEOUT_MS);

    window.InvoiceNinjaEmbed = {
      ...window.InvoiceNinjaEmbed,
      init: (config: EmbedInit) => {
        if (config?.token) {
          setTabToken(config.token);
        }

        hostNonce = config?.nonce || null;

        window.clearTimeout(timeout);
        resolve();
      },
    };

    postToHost('ready');
  });
}

/**
 * Opens a link that would get a new tab. A web view has no tabs: a page of
 * this app opens in place (it keeps this tab's sign-in, which the browser
 * would not have), anything else in the host app's browser.
 */
export function openOutside(url: string): void {
  if (isEmbedded()) {
    if (new URL(url, window.location.href).origin === window.location.origin) {
      window.location.href = url;

      return;
    }

    postToHost('openExternal', { url });

    return;
  }

  window.open(url, '_blank');
}
