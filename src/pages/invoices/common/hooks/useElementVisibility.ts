/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect, useState } from 'react';

interface Options {
  rootMargin?: string;
  threshold?: number | number[];
}

export function useElementVisibility(
  id: string | null | undefined,
  { rootMargin = '0px', threshold = 0 }: Options = {}
): boolean | undefined {
  const [isVisible, setIsVisible] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    if (!id) {
      setIsVisible(undefined);
      return;
    }

    let observer: IntersectionObserver | null = null;
    let cancelled = false;

    const tryAttach = () => {
      if (cancelled) return;
      const element = document.getElementById(id);
      if (!element) {
        setIsVisible(undefined);
        window.setTimeout(tryAttach, 250);
        return;
      }

      observer = new IntersectionObserver(
        ([entry]) => setIsVisible(entry.isIntersecting),
        { rootMargin, threshold }
      );
      observer.observe(element);
    };

    tryAttach();

    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, [id, rootMargin, threshold]);

  return isVisible;
}
