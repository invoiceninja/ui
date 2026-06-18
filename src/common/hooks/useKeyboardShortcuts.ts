/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect, useCallback } from 'react';
import { usePreventNavigation } from './usePreventNavigation';
import { useResolvedShortcuts } from './useReactSettings';
import { keyboardShortcuts } from '../constants/keyboard-shortcuts';
import { eventMatchesBinding } from '../helpers/keyboard-shortcuts';

export function useKeyboardShortcuts() {
  const preventNavigation = usePreventNavigation();
  const bindings = useResolvedShortcuts();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!event.ctrlKey && !event.metaKey && !event.altKey) {
        return;
      }

      for (const definition of keyboardShortcuts) {
        if (definition.action.type !== 'navigate') {
          continue;
        }

        const binding = bindings[definition.id];

        if (!binding) {
          continue;
        }

        if (eventMatchesBinding(event, binding)) {
          event.preventDefault();
          event.stopPropagation();
          preventNavigation({ url: definition.action.to });
          return;
        }
      }
    },
    [preventNavigation, bindings]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [handleKeyDown]);
}
