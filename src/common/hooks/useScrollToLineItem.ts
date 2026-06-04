/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useScrollToLineItem(ready: boolean) {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (!ready || searchParams.get('line_item') === null) {
      return;
    }

    const timeoutId = setTimeout(() => {
      const element = document.getElementById(
        `line-item-${searchParams.get('line_item')}`
      );

      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [ready, searchParams]);
}
