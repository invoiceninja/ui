/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { isModifierKey, normalizeKey } from '../helpers/keyboard-shortcuts';

const heldKeys = new Set<string>();
let listenerCount = 0;

function handleKeyDown(event: KeyboardEvent) {
  if (!isModifierKey(event.key)) {
    heldKeys.add(normalizeKey(event.key));
  }
}

function handleKeyUp(event: KeyboardEvent) {
  if (!isModifierKey(event.key)) {
    heldKeys.delete(normalizeKey(event.key));
  }
}

function handleBlur() {
  heldKeys.clear();
}

export function getHeldKeys(): Set<string> {
  return heldKeys;
}

export function startTrackingHeldKeys(): void {
  if (listenerCount === 0) {
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('keyup', handleKeyUp, true);
    window.addEventListener('blur', handleBlur);
  }

  listenerCount += 1;
}

export function stopTrackingHeldKeys(): void {
  listenerCount -= 1;

  if (listenerCount <= 0) {
    listenerCount = 0;
    heldKeys.clear();
    document.removeEventListener('keydown', handleKeyDown, true);
    document.removeEventListener('keyup', handleKeyUp, true);
    window.removeEventListener('blur', handleBlur);
  }
}
