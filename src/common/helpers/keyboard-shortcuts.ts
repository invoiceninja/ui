/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

const MODIFIER_KEYS = new Set([
  'Control',
  'Shift',
  'Alt',
  'Meta',
  'CapsLock',
  'NumLock',
  'ScrollLock',
  'OS',
]);

function isMac(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }

  return /Mac|iPhone|iPad|iPod/i.test(
    navigator.platform || navigator.userAgent || ''
  );
}

function hasMod(event: KeyboardEvent | React.KeyboardEvent): boolean {
  return isMac() ? event.metaKey : event.ctrlKey;
}

function hasSecondaryCtrl(event: KeyboardEvent | React.KeyboardEvent): boolean {
  return isMac() ? event.ctrlKey : event.metaKey;
}

function normalizeKey(key: string): string {
  if (key === ' ') {
    return 'space';
  }

  return key.toLowerCase();
}

export function bindingFromEvent(
  event: KeyboardEvent | React.KeyboardEvent
): string | null {
  if (MODIFIER_KEYS.has(event.key)) {
    return null;
  }

  const parts: string[] = [];

  if (hasMod(event) || hasSecondaryCtrl(event)) {
    parts.push('mod');
  }

  if (event.altKey) {
    parts.push('alt');
  }

  if (event.shiftKey) {
    parts.push('shift');
  }

  parts.push(normalizeKey(event.key));

  return parts.join('+');
}

export function eventMatchesBinding(
  event: KeyboardEvent | React.KeyboardEvent,
  binding: string
): boolean {
  if (!binding) {
    return false;
  }

  const parts = binding.toLowerCase().split('+');
  const key = parts[parts.length - 1];
  const wantMod = parts.includes('mod');
  const wantAlt = parts.includes('alt');
  const wantShift = parts.includes('shift');

  if ((hasMod(event) || hasSecondaryCtrl(event)) !== wantMod) {
    return false;
  }

  if (event.altKey !== wantAlt) {
    return false;
  }

  if (event.shiftKey !== wantShift) {
    return false;
  }

  return normalizeKey(event.key) === key;
}

const PRINTABLE_KEY_LABELS: Record<string, string> = {
  space: 'Space',
  enter: 'Enter',
  escape: 'Esc',
  arrowup: '↑',
  arrowdown: '↓',
  arrowleft: '←',
  arrowright: '→',
  backspace: '⌫',
  tab: 'Tab',
};

export function formatBinding(binding: string | null | undefined): string {
  if (!binding) {
    return '';
  }

  const mac = isMac();
  const parts = binding.toLowerCase().split('+');
  const key = parts[parts.length - 1];
  const modifiers = parts.slice(0, -1);

  const labels: string[] = [];

  for (const modifier of ['mod', 'alt', 'shift']) {
    if (!modifiers.includes(modifier)) {
      continue;
    }

    if (modifier === 'mod') {
      labels.push(mac ? '⌘' : 'Ctrl');
    } else if (modifier === 'alt') {
      labels.push(mac ? '⌥' : 'Alt');
    } else if (modifier === 'shift') {
      labels.push(mac ? '⇧' : 'Shift');
    }
  }

  const keyLabel =
    PRINTABLE_KEY_LABELS[key] ??
    (key.length === 1 ? key.toUpperCase() : capitalize(key));

  labels.push(keyLabel);

  return labels.join(' + ');
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
