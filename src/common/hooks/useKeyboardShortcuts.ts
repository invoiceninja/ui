import { useEffect, useCallback } from 'react';
import { usePreventNavigation } from './usePreventNavigation';

const SHORTCUT_KEYS = {
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
} as const;

type ShortcutKey = keyof typeof SHORTCUT_KEYS;

export function useKeyboardShortcuts() {
  const preventNavigation = usePreventNavigation();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!event.ctrlKey || !event.shiftKey || event.altKey || event.metaKey) {
        return;
      }

      const key = event.key.toLowerCase() as ShortcutKey;
      const route = SHORTCUT_KEYS[key];

      if (route) {
        event.preventDefault();
        event.stopPropagation();
        preventNavigation({ url: route });
      }
    },
    [preventNavigation]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [handleKeyDown]);
}
