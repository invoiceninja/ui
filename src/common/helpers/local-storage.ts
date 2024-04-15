/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export function clearLocalStorage() {
  const displayChromeExtensionBanner = localStorage.getItem(
    'displayChromeExtensionBanner'
  );

  localStorage.clear();

  if (displayChromeExtensionBanner) {
    localStorage.setItem(
      'displayChromeExtensionBanner',
      displayChromeExtensionBanner
    );
  }
}
