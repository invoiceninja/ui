import { useEffect, useCallback } from 'react';
import { usePreventNavigation } from './usePreventNavigation';

const SHORTCUT_KEYS: Record<string, string> = {
  c: '/clients/create',
  k: '/products/create',
  i: '/invoices/create',
  r: '/recurring_invoices/create',
  q: '/quotes/create',
  p: '/payments/create',
  e: '/expenses/create',
  o: '/purchase_orders/create',
  d: '/credits/create',
  j: '/projects/create',
  t: '/tasks/create',
  v: '/vendors/create',
  x: '/recurring_expenses/create',
  a: '/transactions/create',
  n: '/docuninja/create',
};

export function useKeyboardShortcuts() {
  const preventNavigation = usePreventNavigation();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!event.ctrlKey || !event.shiftKey || event.altKey || event.metaKey) {
      return;
    }

    const key: string = event.key.toLowerCase();
    const route: string | undefined = SHORTCUT_KEYS[key];

    if (route) {
      event.preventDefault();
      event.stopPropagation();
      preventNavigation({ url: route });
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, []);
}
