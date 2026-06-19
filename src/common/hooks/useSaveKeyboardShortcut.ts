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
import { useResolvedShortcuts } from './useReactSettings';
import { eventMatchesBinding } from '../helpers/keyboard-shortcuts';
import { isShortcutRecordingActive } from './useShortcutRecorder';
import { getHeldKeys } from './useHeldKeys';

interface UseSaveKeyboardShortcutOptions {
  isEnabled: boolean;
  onSave: () => void;
}

export function useSaveKeyboardShortcut({
  isEnabled,
  onSave,
}: UseSaveKeyboardShortcutOptions) {
  const bindings = useResolvedShortcuts();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (isShortcutRecordingActive()) {
        return;
      }

      const binding = bindings.save;

      if (binding && eventMatchesBinding(event, binding, getHeldKeys())) {
        event.preventDefault();
        if (isEnabled) {
          if (
            document.activeElement &&
            document.activeElement !== document.body
          ) {
            (document.activeElement as HTMLElement).blur();
          }
          onSave();
        }
      }
    },
    [isEnabled, onSave, bindings.save]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [handleKeyDown]);
}
