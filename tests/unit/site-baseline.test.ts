import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { siteBaseline } from '@/lib/site-baseline';

describe('accepted site baseline', () => {
  it('covers five pages in all three locales', () => {
    expect(siteBaseline.routes).toHaveLength(15);
    expect(new Set(siteBaseline.routes)).toEqual(
      new Set([
        '/vi',
        '/en',
        '/ko',
        '/vi/menu',
        '/en/menu',
        '/ko/menu',
        '/vi/our-space',
        '/en/our-space',
        '/ko/our-space',
        '/vi/about',
        '/en/about',
        '/ko/about',
        '/vi/visit',
        '/en/visit',
        '/ko/visit',
      ]),
    );
  });

  it('references existing accepted captures for every page and viewport', () => {
    for (const page of siteBaseline.pages) {
      expect(page.screenshots).toHaveLength(9);
      for (const screenshot of page.screenshots) {
        expect(existsSync(resolve(screenshot))).toBe(true);
      }
    }

    expect(
      new Set(siteBaseline.pages.flatMap((page) => page.screenshots)).size,
    ).toBe(45);
  });

  it('records the accepted page and verification contracts', () => {
    expect(siteBaseline.viewports).toEqual([
      'desktop-1440x900',
      'tablet-768x1024',
      'mobile-390x844',
    ]);
    expect(
      siteBaseline.pages.map((page) => ({
        id: page.id,
        path: page.path,
        landmarks: page.landmarks,
        expectedDecodedImages: page.expectedDecodedImages,
      })),
    ).toEqual([
      {
        id: 'home',
        path: '/',
        landmarks: [
          'hero',
          'introduction',
          'signature-highlights',
          'location-invitation',
        ],
        expectedDecodedImages: 6,
      },
      {
        id: 'menu',
        path: '/menu',
        landmarks: [
          'introduction',
          'picks',
          'category-navigation',
          'category-list',
        ],
        expectedDecodedImages: 9,
      },
      {
        id: 'our-space',
        path: '/our-space',
        landmarks: [
          'hero',
          'morning-light',
          'quiet-table',
          'downstairs',
          'upstairs',
          'callout',
        ],
        expectedDecodedImages: 5,
      },
      {
        id: 'about',
        path: '/about',
        landmarks: ['introduction', 'coffee', 'food', 'space', 'community'],
        expectedDecodedImages: 5,
      },
      {
        id: 'visit',
        path: '/visit',
        landmarks: ['introduction', 'information', 'actions', 'map'],
        expectedDecodedImages: 2,
      },
    ]);
    expect(siteBaseline.verificationCommands).toEqual([
      'corepack pnpm lint',
      'corepack pnpm typecheck',
      'corepack pnpm test',
      'corepack pnpm test:e2e',
      'corepack pnpm build',
    ]);
  });

  it('matches the committed generated artifact', () => {
    const artifact = JSON.parse(
      readFileSync(resolve('artifacts/visual-qa/baseline.json'), 'utf8'),
    );
    expect(artifact).toEqual(siteBaseline);
  });

  it.each([
    ['--unknown'],
    ['--check', 'extra'],
    ['--check', '--check'],
    ['--check=true'],
  ])('rejects malformed generator arguments: %j', (...arguments_) => {
    const result = spawnSync(
      process.execPath,
      [
        resolve('node_modules/tsx/dist/cli.mjs'),
        resolve('scripts/generate-visual-baseline.ts'),
        ...arguments_,
      ],
      { encoding: 'utf8' },
    );

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('Usage: pnpm generate:baseline [--check]');
  });
});
