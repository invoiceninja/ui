import { vi } from 'vitest';

function createLocalStorageMock() {
  const store = new Map<string, string>();

  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };
}

class MockCustomEvent<T = unknown> extends Event {
  detail: T;

  constructor(type: string, init?: { detail?: T }) {
    super(type);
    this.detail = init?.detail as T;
  }
}

const eventListeners = new Map<string, Set<EventListener>>();

function addEventListener(type: string, listener: EventListener) {
  const listeners = eventListeners.get(type) ?? new Set<EventListener>();

  listeners.add(listener);
  eventListeners.set(type, listeners);
}

function removeEventListener(type: string, listener: EventListener) {
  eventListeners.get(type)?.delete(listener);
}

function dispatchEvent(event: Event) {
  eventListeners.get(event.type)?.forEach((listener) => {
    listener(event);
  });

  return true;
}

export function setupDomGlobals() {
  vi.stubGlobal('localStorage', createLocalStorageMock());
  vi.stubGlobal(
    'CustomEvent',
    MockCustomEvent as unknown as typeof CustomEvent
  );
  vi.stubGlobal('window', {
    addEventListener,
    removeEventListener,
    dispatchEvent,
  });
}

export function resetWindowEventListeners() {
  eventListeners.clear();
}

export function teardownDomGlobals() {
  resetWindowEventListeners();
  vi.unstubAllGlobals();
}
