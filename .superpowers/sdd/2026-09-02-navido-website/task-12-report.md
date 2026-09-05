# Task 12 Report: Metadata and Cross-Page Validation

## Changed files

- `src/lib/metadata.ts`: pure localized metadata, sitemap, and robots builders.
- `src/app/sitemap.ts` and `src/app/robots.ts`: route handlers using the initial null site URL.
- `src/app/[locale]/{page,menu,our-space,about,visit}/page.tsx`: localized `generateMetadata` exports.
- `messages/{vi,en,ko}.json`: localized Home, Menu, Our Space, About, and Visit metadata copy.
- `tests/unit/metadata.test.ts`: metadata and null-origin discovery coverage.
- `tests/e2e/navigation.spec.ts`: 15 localized routes at desktop and mobile viewports (30 cases).
- `next.config.ts` and `playwright.config.ts`: deterministic local browser-test origin and Next 16 dev-origin support.
- `docs/missing-content.md`: documents deferred canonical, alternate, and sitemap URLs.

## RED/GREEN evidence

1. RED: `corepack pnpm vitest run tests/unit/metadata.test.ts` failed because
   `@/lib/metadata` did not exist.
2. GREEN: after adding the pure builders, the same command passed 5/5 tests.
3. RED: the new navigation matrix failed before page metadata was wired because pages had
   no localized description metadata.
4. GREEN: after the five `generateMetadata` exports and dictionary updates, the matrix
   passed. The Next 16 development host block was separately reproduced, traced to
   `127.0.0.1` requesting HMR from a localhost-initialized server, and fixed with the
   documented `allowedDevOrigins: ['127.0.0.1']` configuration.

## Discovery behavior

- `initialVisitBusinessConfig.siteUrl` remains `null`.
- A null origin omits canonical and language-alternate metadata, returns an empty sitemap,
  and returns crawl-permitting robots rules without a sitemap property.
- A verified origin passed to the pure builder produces absolute locale-prefixed canonical
  and `vi`, `en`, and `ko` alternate URLs with the exact supplied origin.

## Navigation matrix

`tests/e2e/navigation.spec.ts` covers Home, Menu, Our Space, About, and Visit for `vi`,
`en`, and `ko` at `1440x900` and `390x844`: 15 routes and 30 route/viewport cases. Each
case verifies status and language, one main landmark and H1, accessible navigation and
locale switching, image alternative/decoding checks, page/console/request failures,
horizontal overflow, and visible text overflow. Expected Next development HMR transport
messages are excluded from page-console failure collection.

## Verification

- `corepack pnpm vitest run tests/unit/metadata.test.ts`: pass, 5/5.
- `corepack pnpm playwright test tests/e2e/navigation.spec.ts --workers=1`: pass, 30/30.
- `corepack pnpm test`: pass, 45/45.
- `corepack pnpm playwright test --workers=1 --reporter=dot`: pass, full suite with no
  failure artifacts.
- `corepack pnpm typecheck`: pass.
- `corepack pnpm lint`: pass.
- `corepack pnpm format:check`: pass.
- `corepack pnpm validate:menu`: pass.
- `corepack pnpm build`: pass; production output includes the localized SSG routes,
  `robots.txt`, and `sitemap.xml`.
- `menu.json` SHA-256: `A7040FE8B651E60923851798F58DADBF8C6455F68E3A6F6D4715F6FA2106F0AE`.
- `next-env.d.ts`: restored to its base declaration after test/build generation.

## Review and deviations

Base-to-head self-review found no task-specific defects. Generated visual-QA artifact
changes from Playwright were restored and excluded. The deferred Task 11 Visit
label-comparison Minor was not changed.
