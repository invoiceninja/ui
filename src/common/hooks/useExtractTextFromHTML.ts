/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export function useExtractTextFromHTML() {
  return (html: string) => {
    return (
      new DOMParser().parseFromString(html, 'text/html').documentElement
        .textContent || ''
    );
  };
}
