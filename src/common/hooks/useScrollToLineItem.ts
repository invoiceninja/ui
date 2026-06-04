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

interface Options {
  ready: boolean;
}

export function useScrollToLineItem({ ready }: Options) {
  const [searchParams, setSearchParams] = useSearchParams();

  const lineItemId = searchParams.get('line_item_id');

  useEffect(() => {
    if (!ready || !lineItemId) {
      return;
    }

    const elementId = `line-item-${lineItemId}`;
    let cancelled = false;
    let attempts = 0;
    let timeoutId: number | undefined;

    const tryScroll = () => {
      if (cancelled) {
        return;
      }

      const element = document.getElementById(elementId);

      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });

        setSearchParams(
          (current) => {
            const next = new URLSearchParams(current);
            next.delete('line_item_id');
            return next;
          },
          { replace: true }
        );

        return;
      }

      if (attempts >= 20) {
        return;
      }

      attempts += 1;
      timeoutId = window.setTimeout(tryScroll, 100);
    };

    tryScroll();

    return () => {
      cancelled = true;

      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [ready, lineItemId, setSearchParams]);
}
