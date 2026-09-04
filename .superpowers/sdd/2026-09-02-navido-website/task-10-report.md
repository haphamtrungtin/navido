# Task 10: About Page Report

## Changed Files

- `src/app/[locale]/about/page.tsx`
- `src/sections/about/about-introduction.tsx`
- `src/sections/about/about-theme.tsx`
- `messages/vi.json`, `messages/en.json`, `messages/ko.json`
- `tests/e2e/about.spec.ts`, `tests/e2e/about-visual.spec.ts`
- `package.json`
- `artifacts/visual-qa/about/*`
- `.superpowers/sdd/2026-09-02-navido-website/task-10-report.md`

## TDD Evidence

- RED: `pnpm exec playwright test tests/e2e/about.spec.ts --workers=1` failed for `vi`, `en`, and `ko` because every `/[locale]/about` response was `404` rather than `200`.
- GREEN: the same focused route suite passed `3/3` after the localized route, sections, and dictionaries were added.
- Visual verifier RED: the first nine-viewport run exposed an invalid test selector: it measured the eyebrow paragraph instead of the theme body, producing a negative heading-to-body gap.
- Visual verifier GREEN: the test now addresses the body with `data-about-body`; its focused desktop test and final `pnpm verify:about-visual` run passed.

## Verification Results

| Command | Result |
| --- | --- |
| `pnpm exec playwright test tests/e2e/about.spec.ts --workers=1` | 3 passed |
| `pnpm verify:about-visual` | 9 passed |
| `pnpm test` | 31 passed in 9 files |
| `pnpm test:e2e` | 55 passed |
| `pnpm typecheck` | passed |
| `pnpm lint` | passed |
| `pnpm format:check` | passed |
| `pnpm validate:menu` | passed |
| `pnpm build` | passed; all three About routes were statically generated |

## Visual Artifacts

`artifacts/visual-qa/about/` contains `metrics.json`, `comparison.md`, and PNG captures for `vi`, `en`, and `ko` at desktop `1440x900`, derived tablet `768x1024`, and mobile `390x844`.

The executable gate measures sequence, image decoding and `object-fit: cover`, 12/8/1 grid tracks, desktop/tablet alternating image sides, mobile image-before-copy theme order, constrained copy widths, 20px heading-to-body gaps, sticky header position, section containment, and text/document overflow. All measurements recorded zero text overflow and document widths equal to their viewport widths.

## Comparison and Corrections

Desktop matches the Stitch editorial intent through staggered image/copy placement and generous negative space. Tablet is explicitly documented as a derived eight-column composition. Mobile retains all four themes and stacks each theme image before its copy.

- Round 1: corrected the visual verifier to distinguish the eyebrow from the body paragraph. This was a measurement defect, not a rendered discrepancy; no page layout adjustment was required.
- Rounds 2-3: not needed.

## Source Integrity and Deviations

`menu.json` SHA-256 after all checks: `A7040FE8B651E60923851798F58DADBF8C6455F68E3A6F6D4715F6FA2106F0AE`.

`next-env.d.ts` was restored to the base version after local development regenerated it. There are no scope deviations.

## Fix Round 1: Enforced Visual Contracts

The visual gate now resets the page to scroll position zero before collecting capture metrics and producing every full-page PNG. It verifies exact ordered approved image URLs, image-before-copy DOM order with `compareDocumentPosition`, rendered mobile order, crop ratios, natural-to-frame crop deltas, frame widths and heights calculated from the active grid tracks, constrained copy widths, track starts, horizontal negative-space gaps, asymmetric center separation, section bounds, and text containment.

### RED Evidence

- Screenshot capture: before the reset, the focused desktop verifier failed with `Expected: 0` and `Received: 480` for `window.scrollY` immediately before the full-page screenshot.
- Frame geometry: temporarily changing Coffee from `4 / 5` to `1 / 1` failed the frame-height tolerance with `Expected: <= 3` and `Received: 113`.
- Approved source URL: temporarily changing Coffee to `/images/stitch/home-pour-over.jpg` failed the exact image URL array, which expected `/images/stitch/about-pour-over.jpg`.
- Semantic order: temporarily moving the copy before the image in the theme DOM failed `domImageBeforeCopy` with `Expected: true` and `Received: false` while CSS still rendered the image first.

All temporary source regressions were restored. No production layout correction was required; the implementation already met the intended geometry. The visual verifier and generated artifacts were corrected.

### GREEN Evidence

| Command | Result |
| --- | --- |
| `pnpm verify:about-visual` | 9 passed, all artifacts regenerated with `captureScrollY: 0` |
| `pnpm exec playwright test tests/e2e/about.spec.ts --workers=1` | 3 passed |
| `pnpm test` | 31 passed in 9 files |
| `pnpm test:e2e` | 55 passed |
| `pnpm typecheck` | passed |
| `pnpm lint` | passed |
| `pnpm format:check` | passed |
| `pnpm validate:menu` | passed |
| `pnpm build` | passed; static About routes generated for all locales |

`menu.json` SHA-256 after the fix round remained `A7040FE8B651E60923851798F58DADBF8C6455F68E3A6F6D4715F6FA2106F0AE`.

## Fix Round 2: Independent Geometry Verification

The visual verifier now uses fixed per-viewport geometry contracts derived from
the intended Tailwind layout rather than the rendered grid: the 1200px maximum
container, 20px/24px gutters, 12/8/1 column breakpoints, and 48px/32px gaps.
At 1440px, 768px, and 390px it independently checks the introduction and all
four theme frame positions, dimensions, constrained copy widths, and the
desktop/tablet horizontal negative-space gaps. The 2px mobile and 3px
desktop/tablet tolerances allow rounding and font/layout subpixels without
accepting token-level regressions. Introduction and theme image collection now
also records and requires `object-fit: cover` with computed
`object-position: 50% 50%`; crop coverage includes each natural-to-frame ratio
delta.

### RED Evidence

- Container/track gap: temporarily changing the desktop theme grid from
  `lg:gap-12` to `lg:gap-8` failed the desktop contract with `Expected: <= 3`
  and `Received: 9` for an independently expected frame coordinate.
- Crop position: temporarily changing Coffee from `objectPosition: 'center'`
  to `'left top'` failed with `Expected: "50% 50%"` and `Received: "0% 0%"`.
- Introduction geometry: temporarily changing its frame from `16 / 9` to
  `4 / 5` failed the independent frame-height contract with `Expected: <= 3`
  and `Received: 379`.
- Text containment: temporarily adding `translate-x-[400px]` to the theme body
  failed the mobile overflow contract with `Expected: <= 390` and
  `Received: 770` document width.

Each mutation was restored before the final artifact and quality-gate runs. No
production layout correction was necessary; this round corrected the visual
verification baseline and added the missing introduction/crop coverage.

### GREEN Evidence

| Command | Result |
| --- | --- |
| `pnpm verify:about-visual` | 9 passed; all nine captures, metrics, and comparison notes regenerated at scroll position zero |
| `pnpm exec playwright test tests/e2e/about.spec.ts --workers=1` | 3 passed |
| `pnpm test` | 31 passed in 9 files |
| `pnpm test:e2e` | 55 passed |
| `pnpm typecheck` | passed |
| `pnpm lint` | passed |
| `pnpm format:check` | passed |
| `pnpm validate:menu` | passed |
| `pnpm build` | passed; static About routes generated for all locales |
