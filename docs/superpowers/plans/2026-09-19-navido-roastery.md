# NAVIDO Roastery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (native execution) to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a localized, visually distinctive Roastery page that explains NAVIDO's in-house roasting, derives public coffee/origin data from the existing menu repository, and drives visitors to the menu and store without adding commerce.

**Architecture:** Keep the existing localized layout and navigation primitives. Add a typed `features/roastery` selector layer, presentational sections under `sections/roastery`, and a static route under `[locale]/roastery`; use a dedicated media mapping with explicit temporary replacement status. Extend the existing metadata and sitemap registries instead of creating parallel SEO infrastructure.

**Tech Stack:** Next.js App Router, React, TypeScript, next-intl, next/image, Tailwind utility classes, Vitest, Testing Library, Playwright, Prettier, ESLint.

**Spec:** `docs/superpowers/specs/2026-09-19-navido-roastery-design.md`

## Global Constraints

- Preserve the shared header, footer, typography, navigation behavior, and existing five route designs.
- Public claims are limited to in-house roasting, a commercial high-capacity roaster, multiple origins, a dedicated roaster, signature coffee, and packaged beans available to take home.
- Do not publish a manufacturer, model, batch capacity, roast profile, production domain, checkout, cart, reservation, or payment flow.
- Keep `menu.json` and `normalized-menu.generated.json` unchanged; filter hidden products through selectors.
- Temporary media must be owner-supplied NAVIDO imagery and carry a replacement key in code; do not download or invent third-party photography.
- All customer-visible copy must exist in Vietnamese, English, and Korean message files.

## Review Focus

- Hidden/mock menu rows must never appear in origins or bean selectors — test selector output against `MOCK_BEANS`.
- No packaged beans currently survive the public publication filter — test the intentional empty state without throwing.
- Localized and external links must preserve locale prefixes and `noreferrer` semantics — test href and target/rel values.
- Temporary image replacements must be explicit without leaking internal replacement keys into visible copy — test the media mapping and rendered alt text separately.
- Narrow screens must not overflow the dark editorial bands — cover 390px visual E2E and assert no horizontal overflow.

---

### Task 1: Add failing selector tests and the Roastery data boundary

**Files:**
- Create: `src/features/roastery/domain/types.ts`
- Create: `src/features/roastery/media.ts`
- Create: `src/features/roastery/selectors.ts`
- Test: `tests/unit/roastery-selectors.test.ts`

**Interfaces:**
- Consumes: `MenuItem`, `localMenuRepository`, `getMenuPublicationStatus`.
- Produces: `RoasteryMediaKey`, `RoasteryMediaAsset`, `getRoasteryOrigins()`, `getRoasteryCoffeePicks(limit)`, and `getRoasteryBeanProducts()`.

- [ ] **Step 1: Write the failing selector tests**

  Add tests that assert:

  ```ts
  expect(getRoasteryOrigins().every((origin) => origin.sourceCategoryCode !== 'MOCK_BEANS')).toBe(true);
  expect(getRoasteryCoffeePicks(3)).toHaveLength(3);
  expect(getRoasteryBeanProducts()).toEqual([]);
  expect(getRoasteryMedia('roaster-machine')).toMatchObject({ replacementStatus: 'temporary' });
  ```

  Include a pure helper test with duplicate origin labels to pin stable deduplication and an empty-input test for `selectRoasteryItems([])`.

- [ ] **Step 2: Run the focused tests and verify they fail**

  Run: `pnpm exec vitest run tests/unit/roastery-selectors.test.ts`

  Expected: FAIL because the Roastery domain modules and selectors do not exist.

- [ ] **Step 3: Implement the typed selector boundary**

  Define `RoasteryOrigin` with `label`, `sourceCategoryCode`, and `sourceRows`; define `RoasteryMediaAsset` with `src`, `altKey`, `replacementStatus`, and `replacementKey`. Derive origins from public coffee-related items, dedupe by normalized English name, select the first three public signature/specialty-coffee/coffee items for picks, and return only public items with `categoryId === 'coffee-beans'` for beans. Return frozen arrays. Use owner-supplied `/images/navido/coffee/...`, `/images/navido/space/...`, and `/images/navido/menu/...` paths as temporary media and set keys `roaster-machine`, `roasting-process`, `roasting-team`, and `packaging`.

- [ ] **Step 4: Run the focused tests and verify they pass**

  Run: `pnpm exec vitest run tests/unit/roastery-selectors.test.ts`

  Expected: PASS, including the empty bean state and hidden mock filtering.

- [ ] **Step 5: Commit the selector boundary**

  ```bash
  git add src/features/roastery tests/unit/roastery-selectors.test.ts
  git commit -m "feat: add Roastery content selectors"
  ```

### Task 2: Extend localized navigation and metadata registries

**Files:**
- Modify: `src/lib/site-config.ts`
- Modify: `src/lib/metadata.ts`
- Modify: `src/app/sitemap.ts`
- Modify: `messages/vi.json`
- Modify: `messages/en.json`
- Modify: `messages/ko.json`
- Test: `tests/unit/i18n.test.ts`
- Test: `tests/unit/metadata.test.ts`

**Interfaces:**
- Consumes: `navigationItems`, `pagePaths`, `buildPageMetadata`, `buildSitemap`.
- Produces: a `roastery` navigation key, `MetadataPage` support for `roastery`, and localized `Navigation.roastery` plus `Metadata.roastery` messages.

- [ ] **Step 1: Extend tests first**

  Assert navigation keys include `/roastery`, all three locale messages have a non-empty `Navigation.roastery`, `getLocalizedPath('vi', 'roastery')` returns `/vi/roastery`, and a sitemap generated with a temporary origin includes all three Roastery URLs.

- [ ] **Step 2: Run focused tests to verify failure**

  Run: `pnpm exec vitest run tests/unit/i18n.test.ts tests/unit/metadata.test.ts`

  Expected: FAIL because the registries do not contain `roastery`.

- [ ] **Step 3: Implement registry/message changes**

  Add `{ href: '/roastery', key: 'roastery' }` after the menu item, add `roastery: '/roastery'` to `pagePaths`, and add professional localized labels/descriptions. Keep the existing five labels unchanged.

- [ ] **Step 4: Run focused tests and formatting**

  Run: `pnpm exec vitest run tests/unit/i18n.test.ts tests/unit/metadata.test.ts`; then `pnpm exec prettier --write src/lib/site-config.ts src/lib/metadata.ts src/app/sitemap.ts messages/vi.json messages/en.json messages/ko.json tests/unit/i18n.test.ts tests/unit/metadata.test.ts`.

  Expected: PASS and formatted files.

- [ ] **Step 5: Commit navigation and SEO registry changes**

  ```bash
  git add src/lib/site-config.ts src/lib/metadata.ts src/app/sitemap.ts messages tests/unit/i18n.test.ts tests/unit/metadata.test.ts
  git commit -m "feat: add localized Roastery navigation"
  ```

### Task 3: Build the Roastery presentational sections

**Files:**
- Create: `src/sections/roastery/roastery-hero.tsx`
- Create: `src/sections/roastery/roastery-process.tsx`
- Create: `src/sections/roastery/roastery-origins.tsx`
- Create: `src/sections/roastery/roastery-beans.tsx`
- Create: `src/sections/roastery/roastery-visit.tsx`
- Test: `tests/components/roastery-sections.test.tsx`

**Interfaces:**
- Consumes: typed selector outputs, `Locale`, `businessProfile`, `conversionLinks`, `EditorialImage`, `Container`, `Eyebrow`, and `TextLink`.
- Produces: semantic sections with `data-roastery-section` attributes and no route-specific data fetching.

- [ ] **Step 1: Write component tests**

  Render the sections with fixture data and assert one H1, process list semantics, origin/bean list semantics, visible empty bean copy, localized `/vi/menu` links, Maps and `tel:` actions, and `rel="noreferrer" target="_blank"` on Maps.

- [ ] **Step 2: Run component tests to verify failure**

  Run: `pnpm exec vitest run tests/components/roastery-sections.test.tsx`

  Expected: FAIL because the section modules do not exist.

- [ ] **Step 3: Implement the visual sections**

  Use the dark palette only inside the Roastery body; keep all layout primitives consistent with existing pages. Mark temporary media through a visually hidden `data-roastery-media-status="temporary"` hook and an accessible caption such as “NAVIDO image placeholder — replace with roaster photography” only where the page design calls for an editorial note. Keep decorative rules `aria-hidden` and use semantic `ol`/`ul` lists.

- [ ] **Step 4: Run component tests and inspect a local render**

  Run: `pnpm exec vitest run tests/components/roastery-sections.test.tsx`; then run `pnpm dev` and inspect `/vi/roastery` at 390px and 1440px with the existing browser QA workflow.

  Expected: PASS with no missing images, one H1, and no horizontal overflow.

- [ ] **Step 5: Commit the presentational sections**

  ```bash
  git add src/sections/roastery tests/components/roastery-sections.test.tsx
  git commit -m "feat: add Roastery editorial sections"
  ```

### Task 4: Add the localized Roastery route

**Files:**
- Create: `src/app/[locale]/roastery/page.tsx`
- Test: `tests/e2e/roastery.spec.ts`

**Interfaces:**
- Consumes: `getTranslations`, `getRoasteryOrigins`, `getRoasteryCoffeePicks`, `getRoasteryBeanProducts`, `getRoasteryMedia`, `businessProfile`, `conversionLinks`, and the five Roastery sections.
- Produces: statically generated localized pages with page metadata and conversion links.

- [ ] **Step 1: Write the failing E2E coverage**

  Add one test per locale that visits `/${locale}/roastery`, asserts status 200, one H1, navigation link reachability, the process/origin sections, no `[data-commerce-control]`, menu CTA locale prefix, Maps href, and `tel:+84368979361`.

- [ ] **Step 2: Run the E2E test to verify failure**

  Run: `pnpm exec playwright test tests/e2e/roastery.spec.ts --workers=1`

  Expected: FAIL because the route is absent.

- [ ] **Step 3: Implement the static route**

  Follow the existing localized page pattern: `dynamic = 'force-static'`, `generateStaticParams()` from `locales`, `generateMetadata()` using `buildPageMetadata({ page: 'roastery' })`, and `notFound()` for invalid locales. Load typed `Roastery` and `Metadata` messages, derive public menu data, and compose the five sections.

- [ ] **Step 4: Run the E2E test and verify all locales pass**

  Run: `pnpm exec playwright test tests/e2e/roastery.spec.ts --workers=1`

  Expected: PASS for vi, en, and ko with no commerce controls.

- [ ] **Step 5: Commit the route**

  ```bash
  git add "src/app/[locale]/roastery/page.tsx" tests/e2e/roastery.spec.ts
  git commit -m "feat: add localized Roastery page"
  ```

### Task 5: Add Roastery visual QA and regression coverage

**Files:**
- Create: `tests/e2e/roastery-visual.spec.ts`
- Modify: `tests/e2e/navigation.spec.ts`
- Modify: `tests/e2e/conversion.spec.ts`
- Create/Modify: `artifacts/visual-qa/roastery/`

**Interfaces:**
- Consumes: the complete localized route and section data from Tasks 1–4.
- Produces: deterministic screenshots/metrics for Vietnamese at 1440×900, 768×1024, and 390×844 plus English/Korean smoke coverage.

- [ ] **Step 1: Add deterministic visual assertions**

  Capture the three Vietnamese viewports, assert the H1, dark hero band, process section, origins list, and no horizontal overflow. Add English/Korean smoke checks for the same landmarks and localized navigation.

- [ ] **Step 2: Run the visual tests and review screenshots**

  Run: `pnpm exec playwright test tests/e2e/roastery-visual.spec.ts --workers=1`.

  Expected: PASS and refreshed artifacts under `artifacts/visual-qa/roastery/`; review each screenshot for contrast, crop, overflow, and CTA visibility.

- [ ] **Step 3: Extend navigation/conversion matrices**

  Add `/roastery` to the existing locale/viewport navigation and conversion matrices, preserving all current route assertions.

- [ ] **Step 4: Run the focused regression matrix**

  Run: `pnpm exec playwright test tests/e2e/navigation.spec.ts tests/e2e/conversion.spec.ts --workers=1`.

  Expected: PASS for all locales and existing routes.

- [ ] **Step 5: Commit visual and regression evidence**

  ```bash
  git add tests/e2e/navigation.spec.ts tests/e2e/conversion.spec.ts tests/e2e/roastery-visual.spec.ts artifacts/visual-qa/roastery
  git commit -m "test: add Roastery visual QA"
  ```

### Task 6: Run the complete verification gates

**Files:**
- Modify: `artifacts/visual-qa/index.md`
- Modify: `artifacts/visual-qa/page-comparison-summary.md`

**Interfaces:**
- Consumes: all implementation and tests from Tasks 1–5.
- Produces: a clean, reproducible Goal 5 branch with documented visual evidence.

- [ ] **Step 1: Run unit/component tests**

  Run: `pnpm test:unit`.

  Expected: all unit and component tests pass, including the new Roastery suites.

- [ ] **Step 2: Run static checks**

  Run: `pnpm typecheck`; `pnpm lint`; `pnpm format:check`.

  Expected: all commands exit 0.

- [ ] **Step 3: Run production build**

  Run: `pnpm build`.

  Expected: `/${locale}/roastery` appears in the static route table for all three locales, with no metadata or image errors.

- [ ] **Step 4: Run the full E2E suite**

  Run: `pnpm test:e2e`.

  Expected: all existing and Roastery tests pass; update visual index/summary only from reviewed screenshots.

- [ ] **Step 5: Review diff and commit the evidence**

  Run: `git diff --check`; `git status --short`; review `artifacts/visual-qa/roastery/` and update the two index files with route/viewport counts.

  ```bash
  git add artifacts/visual-qa/index.md artifacts/visual-qa/page-comparison-summary.md
  git commit -m "chore: verify Roastery milestone"
  ```

