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

const MODIFIER_ORDER = ['mod', 'alt', 'shift'];

function isMac() {
  if (typeof navigator === 'undefined') {
    return false;
  }

  return /Mac|iPhone|iPad|iPod/i.test(
    navigator.platform || navigator.userAgent || ''
  );
}

function hasMod(event: KeyboardEvent | React.KeyboardEvent) {
  return isMac() ? event.metaKey : event.ctrlKey;
}

function hasSecondaryCtrl(event: KeyboardEvent | React.KeyboardEvent) {
  return isMac() ? event.ctrlKey : event.metaKey;
}

export function isModifierKey(key: string) {
  return MODIFIER_KEYS.has(key);
}

export function normalizeKey(key: string) {
  if (key === ' ') {
    return 'space';
  }

  return key.toLowerCase();
}

function modifierParts(event: KeyboardEvent | React.KeyboardEvent) {
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

  return parts;
}

export function buildBinding(modifiers: string[], keys: string[]) {
  const orderedModifiers = MODIFIER_ORDER.filter((modifier) =>
    modifiers.includes(modifier)
  );
  const orderedKeys = keys.filter((key, index) => keys.indexOf(key) === index);

  return [...orderedModifiers, ...orderedKeys].join('+');
}

export function bindingFromState(
  event: KeyboardEvent | React.KeyboardEvent,
  keys: string[]
) {
  const modifiers = modifierParts(event);

  if (!modifiers.length && !keys.length) {
    return null;
  }

  return buildBinding(modifiers, keys);
}

function splitBinding(binding: string) {
  const modifiers: string[] = [];
  const keys: string[] = [];

  for (const part of binding.toLowerCase().split('+')) {
    if (MODIFIER_ORDER.includes(part)) {
      modifiers.push(part);
    } else {
      keys.push(part);
    }
  }

  return { modifiers, keys };
}

export function eventMatchesBinding(
  event: KeyboardEvent | React.KeyboardEvent,
  binding: string,
  heldKeys?: string[]
) {
  if (!binding) {
    return false;
  }

  const { modifiers, keys } = splitBinding(binding);

  if (
    (hasMod(event) || hasSecondaryCtrl(event)) !== modifiers.includes('mod')
  ) {
    return false;
  }

  if (event.altKey !== modifiers.includes('alt')) {
    return false;
  }

  if (event.shiftKey !== modifiers.includes('shift')) {
    return false;
  }

  const pressed = [...(heldKeys ?? [])];
  const current = normalizeKey(event.key);

  if (!pressed.includes(current)) {
    pressed.push(current);
  }

  if (pressed.length !== keys.length) {
    return false;
  }

  return keys.every((key, index) => pressed[index] === key);
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

function formatModifiers(parts: string[]) {
  const mac = isMac();
  const labels: string[] = [];

  for (const modifier of MODIFIER_ORDER) {
    if (!parts.includes(modifier)) {
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

  return labels;
}

function formatKey(key: string) {
  return (
    PRINTABLE_KEY_LABELS[key] ??
    (key.length === 1 ? key.toUpperCase() : capitalize(key))
  );
}

export function formatBinding(binding: string | null | undefined) {
  if (!binding) {
    return '';
  }

  const { modifiers, keys } = splitBinding(binding);

  const labels = formatModifiers(modifiers);

  for (const key of keys) {
    labels.push(formatKey(key));
  }

  return labels.join(' + ');
}

export function formatRecorderPreview(binding: string | null | undefined) {
  if (!binding) {
    return '';
  }

  const { keys } = splitBinding(binding);

  if (keys.length === 0) {
    return [...formatBinding(binding).split(' + '), '…'].join(' + ');
  }

  return formatBinding(binding);
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
