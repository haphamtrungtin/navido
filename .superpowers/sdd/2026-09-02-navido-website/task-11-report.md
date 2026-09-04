# Task 11 Report: Visit Page

## Changed Files

- `src/app/[locale]/visit/page.tsx`
- `src/sections/visit/visit-information.tsx`
- `src/sections/visit/visit-actions.tsx`
- `src/sections/visit/visit-map.tsx`
- `src/lib/site-config.ts`
- `messages/vi.json`
- `messages/en.json`
- `messages/ko.json`
- `tests/components/visit-actions.test.tsx`
- `tests/e2e/visit.spec.ts`
- `tests/e2e/visit-visual.spec.ts`
- `package.json`
- `artifacts/visual-qa/visit/*`

## Implementation

`VisitBusinessConfig` declares `address`, `hours`, `phone`, `mapsUrl`,
`grabUrl`, `instagramUrl`, `facebookUrl`, and `siteUrl` as `string | null`.
`initialVisitBusinessConfig` sets every field to `null`. The page exposes
information, actions, and map sections without emitting a telephone, Maps,
Grab, Instagram, Facebook, or placeholder action until a corresponding value
is verified.

The page uses only `/images/stitch/visit-exterior.jpg` and
`/images/stitch/visit-map-placeholder.jpg`. The map is a non-interactive
figure, not a directions target.

## RED/GREEN Evidence

- RED: `visit-actions.test.tsx` failed to resolve the absent `VisitActions`
  module before implementation.
- GREEN: `pnpm.cmd vitest run tests/components/visit-actions.test.tsx` passed
  4 tests after implementation.
- RED: the section-heading assertion expected `Plan your visit` and failed
  against the incorrect `Directions` heading.
- GREEN: the focused component suite passed after adding the independent
  localized action-section heading.
- RED mutation: setting `mapsUrl` to a temporary Google Maps URL removed the
  directions pending text; all 3 localized route tests failed as expected.
- RED mutation: changing the map frame from `5 / 4` to `1 / 1` violated the
  independent map-height visual contracts at desktop, tablet, and mobile in
  all 9 visual cases. The frame was restored to `5 / 4`.

## Command Results

| Command | Result |
| --- | --- |
| `pnpm.cmd vitest run tests/components/visit-actions.test.tsx` | 4 passed |
| `pnpm.cmd playwright test tests/e2e/visit.spec.ts --workers=1` | 3 passed |
| `pnpm.cmd verify:visit-visual` | 9 passed |
| `pnpm.cmd test` | 10 files, 35 tests passed |
| `pnpm.cmd test:e2e` | 67 tests passed |
| `pnpm.cmd lint` | passed |
| `pnpm.cmd typecheck` | passed |
| `pnpm.cmd format:check` | passed |
| `pnpm.cmd validate:menu` | passed |
| `pnpm.cmd exec next build` | passed; all three Visit routes statically generated |

`menu.json` SHA-256: `A7040FE8B651E60923851798F58DADBF8C6455F68E3A6F6D4715F6FA2106F0AE`.

## Visual QA

Artifacts in `artifacts/visual-qa/visit/`:

- `vi`, `en`, and `ko` screenshots at `desktop-1440x900`,
  `tablet-768x1024`, and `mobile-390x844` (9 PNG files)
- `metrics.json`
- `comparison.md`

The executable gate verifies exact approved image URL order, decoded images,
centered cover crops, independent geometry contracts, two visible section
rules, eight pending states, no Visit-content anchors, sticky header, footer,
zero horizontal overflow, text containment, and captures at scroll zero.
Desktop keeps the asymmetric editorial introduction with balanced information
and action columns. Tablet is a derived eight-column layout. Mobile stacks
information, actions, and map in order. Representative desktop and mobile
screenshots were visually inspected; no material discrepancies were found.

Two gate-implementation corrections were required before the green run: the
browser collector no longer references a Node-side header variable, and its
pending-state selector includes definition descriptions. Material visual
correction rounds: 0 of 3.

## Deviations

The package `build` script invokes `corepack`, which is unavailable in this
environment. Menu validation was run independently, then the equivalent
production compiler command `pnpm.cmd exec next build` completed successfully.
`next-env.d.ts` retained its pre-build SHA-256 and needed no restoration.

## Fix Round 1: Pending And Action Isolation

The two Important review findings are covered in this round. Pending Visit
content now has stable `data-visit-pending` identifiers for `address`,
`hours`, `phone`, `directions`, `grab`, `instagram`, `facebook`, and `map`.
Route and visual tests compare the exact locale-specific values and their DOM
order, including the map caption. Component coverage now exercises each action
URL in isolation and verifies the rendered address, hours, and `tel:` phone
semantics for a complete verified configuration.

The review's Minor display-label comparison concern remains intentionally
deferred for this test-focused round; no functional rendering branch was
refactored for it.

### RED/GREEN Evidence

- RED: route and visual tests required eight semantic pending identifiers and
  received zero from the pre-change markup.
- GREEN: the focused route suite passed 3 localized routes and the visual gate
  passed all 9 locale/viewport cases after identifiers were added.
- RED mutation: replacing English `mapPending` with a fabricated address made
  the visual gate fail its exact `map` pending-state comparison at all three
  English viewports. The translation was restored.
- RED mutation: cross-wiring the Directions action to `grabUrl` failed the
  representative href assertion and the Maps/Grab partial configuration cases.
  The action was restored to `mapsUrl`.
- RED mutation: replacing the verified phone `tel:` anchor with a span failed
  the verified VisitInformation link assertion. The telephone anchor was
  restored.
- GREEN: `pnpm.cmd vitest run tests/components/visit-actions.test.tsx` passed
  9 tests after restoration.

### Fix Round 1 Command Results

| Command | Result |
| --- | --- |
| `pnpm.cmd vitest run tests/components/visit-actions.test.tsx` | 9 passed |
| `pnpm.cmd playwright test tests/e2e/visit.spec.ts --workers=1` | 3 passed |
| `pnpm.cmd verify:visit-visual` | 9 passed |
| `pnpm.cmd test` | 10 files, 40 tests passed |
| `pnpm.cmd test:e2e` | 67 tests passed |
| `pnpm.cmd lint` | passed |
| `pnpm.cmd typecheck` | passed |
| `pnpm.cmd format:check` | passed |
| `pnpm.cmd validate:menu` | passed |
| `pnpm.cmd exec next build` | passed |

The Visit visual artifacts were regenerated after the final green run.
