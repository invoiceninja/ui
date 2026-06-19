/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { atom, getDefaultStore } from 'jotai';
import { useEffect } from 'react';
import { isModifierKey, normalizeKey } from '../helpers/keyboard-shortcuts';

export const heldKeysAtom = atom<string[]>([]);

export function getHeldKeys() {
  return getDefaultStore().get(heldKeysAtom);
}

export function useTrackHeldKeys() {
  useEffect(() => {
    const store = getDefaultStore();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isModifierKey(event.key)) {
        return;
      }

      const key = normalizeKey(event.key);

      store.set(heldKeysAtom, (held) =>
        held.includes(key) ? held : [...held, key]
      );
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (isModifierKey(event.key)) {
        return;
      }

      const key = normalizeKey(event.key);

      store.set(heldKeysAtom, (held) => held.filter((value) => value !== key));
    };

    const handleBlur = () => {
      store.set(heldKeysAtom, []);
    };

    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('keyup', handleKeyUp, true);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('blur', handleBlur);
      store.set(heldKeysAtom, []);
    };
  }, []);
}
