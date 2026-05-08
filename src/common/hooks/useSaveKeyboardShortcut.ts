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

interface UseSaveKeyboardShortcutOptions {
  isEnabled: boolean;
  onSave: () => void;
}

export function useSaveKeyboardShortcut({
  isEnabled,
  onSave,
}: UseSaveKeyboardShortcutOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        if (isEnabled) {
          // Blur the active element to trigger any pending onBlur events
          // (e.g., NumberInputField only calls onValueChange on blur)
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
    [isEnabled, onSave]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [handleKeyDown]);
}
