# NAVIDO Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and verify a production-ready five-page NAVIDO Specialty Coffee website in Vietnamese, English, and Korean from the approved Stitch project and raw menu source.

**Architecture:** A statically generated Next.js App Router site uses `next-intl` for locale-prefixed routes and Server Components for page composition. A deterministic Zod pipeline converts untouched `menu.json` records into normalized data and a review report exposed through a read-only repository; Client Components are limited to interactive navigation.

**Tech Stack:** Next.js 16, React, strict TypeScript, Tailwind CSS 4, next-intl, Zod, Vitest, React Testing Library, Playwright, ESLint, Prettier, pnpm.

**Spec:** `docs/superpowers/specs/2026-09-02-navido-website-design.md`

## Global Constraints

- Preserve `menu.json` byte-for-byte; UI modules never import it.
- Use Stitch project `11656008883608654946` as the visual source of truth.
- Use exported Stitch images only as documented temporary placeholders.
- Do not publish unsupported business facts or external links.
- Support exactly `vi`, `en`, and `ko`; Vietnamese is the default.
- Use locale-prefixed routes and preserve pathnames during locale changes.
- Use Server Components by default.
- Keep page content consistent across breakpoints using the richer Stitch composition.
- Visually verify each page at 1440x900, 768x1024, and 390x844 before starting the next page.
- Use Noto Sans with Vietnamese and Korean coverage, visible focus, semantic landmarks, and reduced-motion support.
- Initialize Git in Task 1 because this workspace is not currently a repository.

## File Map

```text
artifacts/visual-qa/                final screenshots and comparison notes
docs/menu-review.md                 generated data review
docs/missing-content.md             unverified facts and temporary assets
messages/{vi,en,ko}.json            localized site copy
public/images/stitch/               temporary Stitch exports
scripts/normalize-menu.ts           data generator/check command
src/app/[locale]/                   localized pages and layout
src/components/                     shared layout, navigation, and UI
src/features/menu/domain/           schemas, normalization, anomalies, types
src/features/menu/repository/       read-only menu interface and local adapter
src/i18n/                           routing, request config, navigation, locale types
src/sections/                       focused page sections
tests/{unit,components,e2e}/         automated verification
```

---

### Task 1: Repository and Tooling

**Files:**
- Create: `.gitignore`, `package.json`, `tsconfig.json`, `next-env.d.ts`
- Create: `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `prettier.config.mjs`
- Create: `vitest.config.ts`, `vitest.setup.ts`, `playwright.config.ts`
- Create: `src/app/layout.tsx`, `src/app/globals.css`, `tests/unit/tooling.test.ts`
- Preserve: `menu.json`, `NAVIDO_CODEX_CLI_MASTER_PROMPT.md`

**Interfaces:**
- Consumes: Node.js 20.9+ and pnpm 10.
- Produces: `dev`, `build`, `start`, `lint`, `typecheck`, `test`, `test:e2e`, `format:check`, and `validate:menu` scripts.

- [ ] **Step 1: Record source integrity and initialize Git**

Run `Get-FileHash menu.json -Algorithm SHA256`, record the value, then run `git init` and `git branch -M main`.

- [ ] **Step 2: Create the package manifest and install dependencies**

Use scripts:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint .",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "test:e2e": "playwright test",
  "format:check": "prettier --check .",
  "validate:menu": "tsx scripts/normalize-menu.ts --check"
}
```

Install current stable `next`, `react`, `react-dom`, `next-intl`, `zod`, and the development tools named in the Tech Stack. Install Playwright Chromium.

- [ ] **Step 3: Write and run the initial failing harness test**

Create `tests/unit/tooling.test.ts` with `expect(true).toBe(true)`. Run `pnpm test tests/unit/tooling.test.ts`; expect failure until Vitest is configured.

- [ ] **Step 4: Configure the tools and minimal root layout**

Set `strict`, `noUncheckedIndexedAccess`, bundler resolution, and `@/* -> src/*`. Configure jsdom and Testing Library setup. Use Tailwind 4's `@tailwindcss/postcss` and `@import "tailwindcss"`. The root layout renders only `<html><body>{children}</body></html>`.

- [ ] **Step 5: Verify and commit**

Run `pnpm test`, `pnpm typecheck`, `pnpm lint`, and `pnpm build`; all must exit 0. Commit with `chore: scaffold NAVIDO web application`.

---

### Task 2: Locale Routing and Dictionaries

**Files:**
- Create: `src/i18n/{types,routing,navigation,request}.ts`, `proxy.ts`
- Create: `messages/{vi,en,ko}.json`
- Create: `src/app/page.tsx`, `src/app/[locale]/{layout,page,not-found}.tsx`
- Create: `tests/unit/i18n.test.ts`

**Interfaces:**
- Produces: `Locale`, `LocalizedText`, `isLocale()`, `getLocalizedValue()`, `routing`, and next-intl navigation wrappers.

- [ ] **Step 1: Write failing locale tests**

```ts
expect(isLocale('vi')).toBe(true);
expect(isLocale('fr')).toBe(false);
expect(getLocalizedValue({vi: 'Cà phê', en: 'Coffee', ko: ''}, 'ko')).toBe('Cà phê');
```

Run `pnpm test tests/unit/i18n.test.ts`; expect module-not-found failure.

- [ ] **Step 2: Implement locale contracts**

```ts
export const locales = ['vi', 'en', 'ko'] as const;
export type Locale = (typeof locales)[number];
export type LocalizedText = Record<Locale, string>;
export const isLocale = (value: string): value is Locale => locales.includes(value as Locale);
export const getLocalizedValue = (value: LocalizedText, locale: Locale) =>
  value[locale].trim() || value.vi.trim() || value.en.trim();
```

- [ ] **Step 3: Configure next-intl routing**

Use `defineRouting({locales, defaultLocale: 'vi', localePrefix: 'always'})`, Next.js 16 `proxy.ts`, validated request dictionary imports, `generateStaticParams`, and `/ -> /vi` redirect. Each dictionary must have matching `Metadata`, `Navigation`, `Common`, `Home`, `Menu`, `OurSpace`, `About`, `Visit`, and `Pending` keys.

- [ ] **Step 4: Verify and commit**

Run locale tests, typecheck, lint, and build. Confirm static `/vi`, `/en`, and `/ko`. Commit with `feat: add localized app routing`.

---

### Task 3: Menu Domain

**Files:**
- Create: `src/features/menu/domain/{types,schemas,anomalies,normalize}.ts`
- Create: `tests/fixtures/menu.ts`, `tests/unit/menu-normalize.test.ts`

**Interfaces:**
- Produces: `normalizeMenu(raw: unknown): NormalizationResult` and `formatPriceVnd(price: number, locale: Locale): string`.

- [ ] **Step 1: Write failing normalization tests**

Use fixtures for multilingual text, both Extras codes, a likely duplicate, missing translations, and malformed price. Assert 130-record preservation behavior, stable IDs like `row-2-signature`, source traceability, anomaly flags, sorted categories, and `85.000 ₫` formatting.

- [ ] **Step 2: Run tests and confirm failure**

Run `pnpm test tests/unit/menu-normalize.test.ts`; expect missing-module failure.

- [ ] **Step 3: Define schemas and types**

`MenuItem` contains `id`, `categoryId`, `sourceCategoryCode`, `sourceName`, localized `name`, `priceVnd`, `sortOrder`, `sourceRow`, `needsReview`, `reviewNotes`, and optional `netWeightGram`. Zod requires positive integer rows, nonempty strings, nonnegative integer prices, integer sort, and optional positive weights.

- [ ] **Step 4: Implement deterministic normalization**

Map all source codes explicitly; merge the two Extras codes only into display ID `extras`. Split Korean parentheticals with Unicode-aware matching, normalize whitespace, preserve source strings, flag generated translations and suspicious records, and detect exact/likely duplicates without deleting data. Format currency through `Intl.NumberFormat` with VND and zero fractional digits.

- [ ] **Step 5: Verify and commit**

Run focused tests and typecheck. Commit with `feat: add menu normalization domain`.

---

### Task 4: Menu Generator and Repository

**Files:**
- Create: `scripts/normalize-menu.ts`
- Create: `src/features/menu/data/normalized-menu.generated.json`
- Create: `docs/menu-review.md`
- Create: `src/features/menu/repository/{menu-repository,local-menu-repository}.ts`
- Create: `tests/unit/menu-repository.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `getCategories(): readonly MenuCategory[]` and `getItemsByCategory(id: string): readonly MenuItem[]`.

- [ ] **Step 1: Write failing repository tests**

Assert that repository categories expose exactly 130 unique source rows, are ordered, merge Extras at display level, and never expose internal codes such as `ITEM_TYPE-MVIF` as IDs.

- [ ] **Step 2: Implement the generator**

Read root `menu.json` as UTF-8, call `normalizeMenu`, and deterministically write generated JSON plus `docs/menu-review.md`. The report groups corrections, generated translations, suspected duplicates, mixed-language names, and suspicious source rows. `--check` compares generated content and exits nonzero on drift or schema failure.

- [ ] **Step 3: Generate data and implement repository**

Run `pnpm tsx scripts/normalize-menu.ts`. Import only generated JSON in the local repository and return sorted readonly arrays.

- [ ] **Step 4: Enforce validation and verify source integrity**

Change build to `pnpm validate:menu && next build`. Run validation, repository tests, typecheck, and the raw-file hash; require the Task 1 checksum.

- [ ] **Step 5: Commit**

Commit with `feat: generate validated menu data`.

---

### Task 5: Assets, Tokens, and Primitives

**Files:**
- Create: `scripts/download-stitch-assets.mjs`, `public/images/stitch/*`
- Create: `docs/missing-content.md`
- Modify: `src/app/globals.css`, `src/app/[locale]/layout.tsx`
- Create: `src/components/layout/container.tsx`
- Create: `src/components/ui/{editorial-image,eyebrow,text-link}.tsx`
- Create: `tests/components/primitives.test.tsx`

**Interfaces:**
- Produces: `Container`, `EditorialImage`, `Eyebrow`, and `TextLink`.

- [ ] **Step 1: Write failing primitive tests**

Assert accessible image names, reserved aspect-ratio classes, and correct locale-link hrefs. Run the test and expect missing components.

- [ ] **Step 2: Download only approved Stitch exports**

Create an explicit URL-to-semantic-filename manifest for the already discovered `aida-public` assets; do not search for more images. Record every image as temporary in `docs/missing-content.md` with all missing business facts.

- [ ] **Step 3: Implement Quietude tokens and fonts**

Define `#fcf9f1` background, `#252521` ink, `#474741` muted ink, `#46382e` espresso, `#536453` botanical, 16%-ink rules, 1200px container, 24px gutter, 20px mobile margin, and 120px section gap. Use Noto Sans/Noto Sans KR and no negative tracking in the implementation, honoring the frontend requirement.

- [ ] **Step 4: Implement and verify primitives**

`EditorialImage` wraps `next/image`, requires alt, aspect, sizes, and optional object position. Run component tests, typecheck, and lint.

- [ ] **Step 5: Commit**

Commit with `feat: add NAVIDO visual foundation`.

---

### Task 6: Shared Navigation and Footer

**Files:**
- Create: `src/lib/site-config.ts`
- Create: `src/components/navigation/{locale-link,language-switcher}.tsx`
- Create: `src/components/layout/{header,mobile-navigation,footer}.tsx`
- Modify: `src/app/[locale]/layout.tsx`
- Create: `tests/components/{language-switcher,mobile-navigation}.test.tsx`
- Create: `artifacts/visual-qa/shared/*`

**Interfaces:**
- Produces: `Header`, `Footer`, and route-preserving `LanguageSwitcher`.

- [ ] **Step 1: Write failing interaction tests**

Assert `/vi/our-space -> /en/our-space`. Assert mobile `aria-expanded`, focus entering the panel, Escape close, and focus restoration.

- [ ] **Step 2: Implement shared shell**

Desktop uses fixed wide navigation and text locale choices. Mobile uses an icon button and full navigation panel with accessible labels. Footer renders localized pending content and no fake links.

- [ ] **Step 3: Run tests and visual gate**

Run component tests, typecheck, and lint. Capture `/vi` at 1440x900 and 390x844, including open mobile navigation. Compare dimensions, borders, wrapping, focus, and overflow; store a concrete discrepancy log.

- [ ] **Step 4: Commit**

Commit with `feat: add localized site navigation`.

---

### Task 7: Home Page

**Files:**
- Create: `src/sections/home/{home-hero,home-introduction,signature-highlights,location-invitation}.tsx`
- Modify: `src/app/[locale]/page.tsx`, `messages/{vi,en,ko}.json`
- Create: `tests/e2e/home.spec.ts`, `artifacts/visual-qa/home/*`

**Interfaces:** Produces all three localized Home routes.

- [ ] **Step 1: Write failing Playwright tests**

For each locale, assert status 200, one `NAVIDO` H1, matching `<html lang>`, main landmark, and working Menu/Visit links.

- [ ] **Step 2: Implement Home**

Compose immersive hero, introduction, three signature highlights, and location invitation. Product labels must come from normalized menu items when they identify products; do not adopt unsupported Stitch-only menu facts.

- [ ] **Step 3: Run functional verification**

Run Home e2e, typecheck, and lint; all exit 0.

- [ ] **Step 4: Complete visual gate**

Capture all three viewports. Compare hierarchy, grid, hero crop, wrapping, rhythm, highlights, location section, and overflow for up to three correction rounds. Note tablet is derived.

- [ ] **Step 5: Commit**

Commit with `feat: implement localized home page`.

---

### Task 8: Menu Page

**Files:**
- Create: `src/features/menu/components/{category-navigation,menu-category,menu-item-row}.tsx`
- Create: `src/app/[locale]/menu/page.tsx`
- Modify: dictionaries
- Create: `tests/components/category-navigation.test.tsx`, `tests/e2e/menu.spec.ts`
- Create: `artifacts/visual-qa/menu/*`

**Interfaces:** Consumes the menu repository; produces complete menu routes and stable anchors.

- [ ] **Step 1: Write failing tests**

Assert active navigation uses `aria-current="location"`, all 130 `[data-menu-item]` rows render, internal category codes do not, and long names do not overflow.

- [ ] **Step 2: Implement Menu**

Render every repository category and item. Desktop uses sticky sidebar; smaller viewports use stable-height horizontal category navigation. A small Client Component uses `IntersectionObserver` for active category. Centralize VND formatting.

- [ ] **Step 3: Run functional verification**

Run component tests, Menu e2e, menu validation, typecheck, and lint.

- [ ] **Step 4: Complete visual gate**

Compare header, nav position, row density, price alignment, image break, sticky behavior, wrapping, and overflow at all viewports. Document that full data extends Stitch's sample row system.

- [ ] **Step 5: Commit**

Commit with `feat: implement normalized menu page`.

---

### Task 9: Our Space Page

**Files:**
- Create: `src/sections/our-space/{space-hero,space-story,space-callout}.tsx`
- Create: `src/app/[locale]/our-space/page.tsx`
- Modify: dictionaries
- Create: `tests/e2e/our-space.spec.ts`, `artifacts/visual-qa/our-space/*`

**Interfaces:** Produces localized Our Space routes.

- [ ] **Step 1: Write failing tests**

For each locale assert one H1 and story IDs `morning-light`, `quiet-table`, `downstairs`, and `upstairs`.

- [ ] **Step 2: Implement richer composition**

Compose hero, four stories, and visit callout with alternating desktop columns, reduced tablet spans, and mobile stacking. Keep copy factual-neutral.

- [ ] **Step 3: Verify function and visuals**

Run route e2e, typecheck, and lint. Capture all viewports; compare proportions, alternating grid, image crops, sequence, callout, and overflow for up to three rounds.

- [ ] **Step 4: Commit**

Commit with `feat: implement our space page`.

---

### Task 10: About Page

**Files:**
- Create: `src/sections/about/{about-introduction,about-theme}.tsx`
- Create: `src/app/[locale]/about/page.tsx`
- Modify: dictionaries
- Create: `tests/e2e/about.spec.ts`, `artifacts/visual-qa/about/*`

**Interfaces:** Produces localized About routes.

- [ ] **Step 1: Write failing tests**

Assert one H1 and four `data-about-theme` values: coffee, food, space, community.

- [ ] **Step 2: Implement About**

Build introduction and asymmetric theme sections without founder history, certifications, awards, statistics, or sustainability claims.

- [ ] **Step 3: Verify function and visuals**

Run route e2e, typecheck, and lint. Compare asymmetry, image sizing, text widths, sequence, gaps, mobile order, and wrapping at all viewports.

- [ ] **Step 4: Commit**

Commit with `feat: implement about page`.

---

### Task 11: Visit Page

**Files:**
- Create: `src/sections/visit/{visit-information,visit-actions,visit-map}.tsx`
- Create: `src/app/[locale]/visit/page.tsx`
- Modify: `src/lib/site-config.ts`, dictionaries
- Create: `tests/components/visit-actions.test.tsx`, `tests/e2e/visit.spec.ts`
- Create: `artifacts/visual-qa/visit/*`

**Interfaces:** Consumes nullable verified config; produces links only for non-null verified values.

- [ ] **Step 1: Write failing pending-state tests**

With null config, assert localized pending text and absence of `tel:`, Maps, Grab, Instagram, and Facebook anchors.

- [ ] **Step 2: Implement Visit**

Define address, hours, phone, Maps, Grab, social, and site URL as `string | null`, initially null. Render anchors only for verified non-null values. Use temporary exterior and map assets with replacement records.

- [ ] **Step 3: Verify function and visuals**

Run component/e2e tests, typecheck, and lint. Compare column balance, crops, map aspect, rules, pending states, stack, and footer at all viewports.

- [ ] **Step 4: Commit**

Commit with `feat: implement visit page`.

---

### Task 12: Metadata and Cross-Page Validation

**Files:**
- Create: `src/lib/metadata.ts`, `src/app/sitemap.ts`, `src/app/robots.ts`
- Modify: all localized page modules and dictionaries
- Create: `tests/unit/metadata.test.ts`, `tests/e2e/navigation.spec.ts`

**Interfaces:** Produces localized metadata and canonical/alternate URLs only when a verified origin exists.

- [ ] **Step 1: Write failing metadata tests**

Assert Korean localized title/description, vi/en/ko alternates when `siteUrl` exists, and no invented `example.com` URL when null.

- [ ] **Step 2: Implement metadata, sitemap, and robots**

Each page exports localized metadata. With null production origin, omit canonical/absolute alternates; sitemap returns no invented URLs and `docs/missing-content.md` records the blocker. Robots allows crawling without a fake sitemap.

- [ ] **Step 3: Add cross-page browser tests**

Navigate all five pages in each locale. Assert one H1, main landmark, keyboard operability, meaningful image alt text, no console/request errors, and no horizontal overflow at 1440 and 390 widths.

- [ ] **Step 4: Verify and commit**

Run unit/e2e tests, typecheck, and lint. Commit with `feat: add localized metadata and discovery`.

---

### Task 13: Handoff and Final Verification

**Files:**
- Create: `README.md`
- Create: `artifacts/visual-qa/{index,page-comparison-summary}.md`
- Modify: comparison records and `.gitignore` as required

**Interfaces:** Produces the Vercel-ready application, complete evidence, and handoff.

- [ ] **Step 1: Build and run production server**

Run `pnpm build` then `pnpm start` on an available port. Require successful build and server response.

- [ ] **Step 2: Verify the 15-route matrix**

Visit five pages in three locales and re-capture any page changed after its visual gate. Confirm no console errors, request failures, broken images, overflow, clipping, or obvious layout shift.

- [ ] **Step 3: Complete visual documentation**

Index every final screenshot. For each page list direct desktop/mobile comparisons, derived tablet behavior, concrete corrections, and any remaining justified difference.

- [ ] **Step 4: Write README**

Document prerequisites, commands, structure, locale editing, menu generation, validation, placeholder replacement, testing, visual QA, Vercel deployment, and the production-domain requirement.

- [ ] **Step 5: Run exact final commands**

Run separately: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e`, `pnpm build`, `pnpm format:check`, `pnpm validate:menu`, the raw menu SHA-256 check, and `git status --short`. Every pnpm command must exit 0 and the checksum must match Task 1.

- [ ] **Step 6: Commit and start review server**

Commit with `docs: complete NAVIDO website handoff`, start `pnpm dev` on an available port, keep it running, and report the exact URL.
