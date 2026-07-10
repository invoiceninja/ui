/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCallback, useEffect } from 'react';
import { keyboardShortcuts } from '../constants/keyboard-shortcuts';
import { eventMatchesBinding } from '../helpers/keyboard-shortcuts';
import { getHeldKeys, useTrackHeldKeys } from './useHeldKeys';
import { usePreventNavigation } from './usePreventNavigation';
import { useResolvedShortcuts } from './useReactSettings';
import { isShortcutRecordingActive } from './useShortcutRecorder';

export function useKeyboardShortcuts() {
  const preventNavigation = usePreventNavigation();
  const bindings = useResolvedShortcuts();

  useTrackHeldKeys();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (isShortcutRecordingActive()) {
        return;
      }

      const heldKeys = getHeldKeys();

      for (const definition of keyboardShortcuts) {
        if (definition.action.type !== 'navigate') {
          continue;
        }

        const binding = bindings[definition.id];

        if (!binding) {
          continue;
        }

        if (eventMatchesBinding(event, binding, heldKeys)) {
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
