/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export function wait(...selectors: string[]) {
  return new Promise((resolve) => {
    if (!selectors.length) {
      resolve([]);
      return;
    }

    const elements = selectors
      .map((selector) => document.querySelector(selector))
      .filter(Boolean);

    if (elements.length === selectors.length) {
      resolve(elements);
      return;
    }

    const observer = new MutationObserver(() => {
      const foundElements = selectors
        .map((selector) => document.querySelector(selector))
        .filter(Boolean);

      if (foundElements.length === selectors.length) {
        observer.disconnect();
        resolve(foundElements);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  });
}
