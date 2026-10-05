import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

const sourceDirectory = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': sourceDirectory,
      'server-only': fileURLToPath(
        new URL('./tests/helpers/server-only.ts', import.meta.url),
      ),
    },
  },
  test: {
    environment: 'jsdom',
    include: [
      'tests/unit/**/*.{test,spec}.{ts,tsx}',
      'tests/components/**/*.{test,spec}.{ts,tsx}',
    ],
    setupFiles: ['./vitest.setup.ts'],
  },
});
