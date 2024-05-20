/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import DOMPurify from 'dompurify';

export function useSanitizeHTML() {
  return (html: string) => {
    return DOMPurify.sanitize(html, {
      USE_PROFILES: { html: true },
    });
  };
}
