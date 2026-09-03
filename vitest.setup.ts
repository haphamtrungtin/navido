import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// next/font is a build-time transform. Component and layout tests exercise the
// class-variable contract through this deterministic stand-in; next build
// verifies the real loader and emitted font files.
vi.mock('next/font/google', () => ({
  Noto_Sans: ({ variable }: { variable: string }) => ({
    variable: `${variable}__loaded`,
  }),
  Noto_Sans_KR: ({ variable }: { variable: string }) => ({
    variable: `${variable}__loaded`,
  }),
}));
