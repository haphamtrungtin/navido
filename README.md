# NAVIDO Website

NAVIDO is a static, localized informational site for a specialty coffee brand. It
uses Next.js App Router, `next-intl`, Tailwind CSS, and a deterministic menu-data
pipeline. The site currently supports Vietnamese (`vi`), English (`en`), and Korean
(`ko`) routes.

## Prerequisites

- Node.js 20.9 or later
- Corepack enabled with pnpm 10 (the repository pins `pnpm@10.34.5`)
- Playwright Chromium for browser tests: `corepack pnpm exec playwright install chromium`

## Commands

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm dev
corepack pnpm build
corepack pnpm start
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm test:e2e
corepack pnpm format:check
corepack pnpm validate:menu
```

`dev` starts the local development server. `build` validates generated menu data
before producing the optimized static build. `start` serves that build after a
successful `build`.

## Source Structure

```text
messages/                    Locale dictionaries for vi, en, and ko
public/images/stitch/        Approved temporary Stitch placeholder exports
scripts/normalize-menu.ts    Deterministic menu generator and validation command
src/app/[locale]/            Localized App Router pages and layouts
src/components/              Shared shell, navigation, and primitives
src/features/menu/           Menu schemas, normalization, generated data, repository
src/i18n/                    Locale routing, navigation, and request configuration
src/sections/                Page-specific server-rendered sections
tests/                       Unit, component, E2E, and visual-contract tests
artifacts/visual-qa/         Accepted screenshots and comparison evidence
docs/                        Menu review and pending-content records
```

## Locale Editing

Edit the matching namespaces in `messages/vi.json`, `messages/en.json`, and
`messages/ko.json` together. The route set is fixed to `/vi`, `/en`, and `/ko`,
with `/menu`, `/our-space`, `/about`, and `/visit` beneath each locale. Use the
typed translation keys consumed by pages and shared navigation; do not add an
unsupported locale without updating `src/i18n/types.ts`, routing, tests, and static
generation.

## Menu Data

`menu.json` is the immutable raw source. Do not edit, reformat, normalize line
endings, or import it from UI code. Its required raw SHA-256 is:

```text
A7040FE8B651E60923851798F58DADBF8C6455F68E3A6F6D4715F6FA2106F0AE
```

Run `corepack pnpm generate:menu` only when a deliberately supplied replacement
raw source needs its derived artifacts refreshed. Run `corepack pnpm validate:menu`
to confirm that `src/features/menu/data/normalized-menu.generated.json` and
`docs/menu-review.md` exactly match the untouched source. The build performs this
validation automatically.

## Assets And Pending Content

Files under `public/images/stitch/` are approved temporary Stitch exports, not
verified NAVIDO photography. Replace an image by updating its documented manifest
and `docs/missing-content.md`, preserving its responsive dimensions, aspect ratio,
alt text, and tests. Never treat the placeholders as evidence for a location or
business claim.

Address, hours, phone, social URLs, Maps, GrabFood, and email are verified in the
baseline sources below. Goal 2 will wire these facts into customer pages. Goal 1
preserves the nullable values in `src/lib/site-config.ts` and the Visit page's
localized pending states. The public production domain remains unverified.

## Baseline content

- Verified business facts: `src/lib/business-profile.ts` and `docs/navido-content-source-of-truth.md`
- Authentic asset intake: `../../incoming-assets/navido`
- Generated asset inventory: `docs/asset-inventory.json` and `docs/asset-inventory.md`
- Provisional menu source: immutable `menu.json`; mock records classify as hidden
- Accepted visual baseline: `artifacts/visual-qa/baseline.json`

Run `corepack pnpm validate:baseline-content` after changing any baseline input.
The external intake directory is required only for asset generation and validation; production builds continue to use committed public assets until later milestones replace them.

## Testing And Visual QA

Run the unit/component suite with `corepack pnpm test` and the browser suite with
`corepack pnpm test:e2e`. The latter covers all five pages in all three locales,
navigation behavior, responsive containment, images, metadata basics, and the
visual contracts.

Accepted screenshots and page evidence are indexed in
`artifacts/visual-qa/index.md`. The comparison summary explains direct desktop and
mobile evidence, derived tablet behavior, prior corrections, and intentional
differences from the approved Stitch composition. Do not replace accepted captures
for metadata-only or documentation-only changes; recapture only when presentation
has changed and record the reason in the relevant page comparison record.

## Deployment

The project is ready for a Vercel deployment as a standard Next.js application:

1. Import the repository in Vercel and use the detected pnpm build command.
2. Ensure the build has access to the committed generated menu artifacts and public
   placeholder assets.
3. Verify the deployed routes in all three locales before publishing.
4. Supply verified business facts and replace temporary assets before public launch.

Do not set `businessProfile.siteUrl` from a preview URL, `localhost`, or an inferred
environment value. A verified production domain must be set first. Until then its
current value is `null`, and the application intentionally emits no canonical URL,
language alternate URLs, sitemap entries, or robots sitemap URL.
