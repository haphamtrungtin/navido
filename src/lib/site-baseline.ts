import { locales } from '@/i18n/types';
import { pagePaths } from '@/lib/metadata';

export type BaselinePage = Readonly<{
  id: 'home' | 'menu' | 'our-space' | 'about' | 'visit';
  path: '/' | '/menu' | '/our-space' | '/about' | '/visit';
  landmarks: readonly string[];
  expectedDecodedImages: number;
  screenshots: readonly string[];
}>;

export type SiteBaseline = Readonly<{
  locales: readonly ['vi', 'en', 'ko'];
  routes: readonly string[];
  viewports: readonly ['desktop-1440x900', 'tablet-768x1024', 'mobile-390x844'];
  pages: readonly BaselinePage[];
  verificationCommands: readonly string[];
}>;

const viewports: SiteBaseline['viewports'] = [
  'desktop-1440x900',
  'tablet-768x1024',
  'mobile-390x844',
];

const pageDefinitions = [
  {
    id: 'home',
    path: pagePaths.home,
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
    path: pagePaths.menu,
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
    path: pagePaths.ourSpace,
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
    path: pagePaths.about,
    landmarks: ['introduction', 'coffee', 'food', 'space', 'community'],
    expectedDecodedImages: 5,
  },
  {
    id: 'visit',
    path: pagePaths.visit,
    landmarks: ['introduction', 'information', 'actions', 'map'],
    expectedDecodedImages: 2,
  },
] as const satisfies readonly Omit<BaselinePage, 'screenshots'>[];

const pages: readonly BaselinePage[] = pageDefinitions.map((page) => ({
  ...page,
  screenshots: locales.flatMap((locale) =>
    viewports.map(
      (viewport) => `artifacts/visual-qa/${page.id}/${locale}-${viewport}.png`,
    ),
  ),
}));

export const siteBaseline: SiteBaseline = {
  locales,
  routes: pageDefinitions.flatMap((page) =>
    locales.map((locale) =>
      page.path === '/' ? `/${locale}` : `/${locale}${page.path}`,
    ),
  ),
  viewports,
  pages,
  verificationCommands: [
    'corepack pnpm lint',
    'corepack pnpm typecheck',
    'corepack pnpm test',
    'corepack pnpm test:e2e',
    'corepack pnpm build',
  ],
};
