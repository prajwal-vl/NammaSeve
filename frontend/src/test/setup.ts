import '@testing-library/jest-dom';
import '@testing-library/jest-dom/vitest';
import '../i18n';

// Mock crypto.randomUUID if not present in jsdom
if (!globalThis.crypto?.randomUUID) {
  Object.defineProperty(globalThis, 'crypto', {
    value: {
      randomUUID: () => '11111111-2222-3333-4444-555555555555',
    },
  });
}
