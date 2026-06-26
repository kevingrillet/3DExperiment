/**
 * Setup global des tests Vitest : matchers DOM de @testing-library/jest-dom,
 * polyfills jsdom (localStorage, matchMedia) et langue déterministe (fr).
 */
import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Selon sa version, jsdom n'expose pas toujours `window.localStorage` ; l'i18n et
// le thème s'appuient dessus : on fournit une implémentation minimale en mémoire.
if (typeof window !== 'undefined' && !window.localStorage) {
  const store = new Map<string, string>();
  const localStorageMock: Storage = {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key) => (store.has(key) ? store.get(key)! : null),
    key: (index) => Array.from(store.keys())[index] ?? null,
    removeItem: (key) => store.delete(key),
    setItem: (key, value) => store.set(key, String(value)),
  };
  Object.defineProperty(window, 'localStorage', { value: localStorageMock, configurable: true });
}

// jsdom n'implémente pas matchMedia : polyfill minimal (utilisé par le thème).
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

// Langue déterministe : on force le français (sinon la langue du navigateur jsdom,
// "en-US", ferait basculer l'app en anglais et casserait les assertions).
Object.defineProperty(window.navigator, 'language', { value: 'fr-FR', configurable: true });

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});
