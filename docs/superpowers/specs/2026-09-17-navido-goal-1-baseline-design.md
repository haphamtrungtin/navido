# NAVIDO Goal 1 Baseline Design

**Date:** 2026-09-17
**Status:** Awaiting written-spec review
**Parent objective:** Complete the NAVIDO website incrementally while preserving its existing design, replacing temporary content with verified business data and real assets, improving visit conversion, adding a distinctive Roastery page, and finishing localization, SEO, accessibility, performance, and release QA.

## Goal

Create an authoritative baseline for every later milestone. Goal 1 does not redesign pages or introduce customer-facing features. It records what exists, what may change, which inputs are verified, which inputs remain provisional, and which tests and screenshots must protect the accepted design.

## Design Constraint

The current `Quietude Editorial` implementation is the design baseline. Later work must preserve its warm-ivory surfaces, restrained typography, large editorial photography, asymmetric grids, thin rules, generous spacing, shared header/footer, and responsive composition.

Existing components should be extended before new parallel components are created. Layout changes require a documented UX reason. The only approved intentional visual departure is the future `/[locale]/roastery` feature page: it keeps the shared shell while using a darker botanical treatment in its page body.

## Existing Route Inventory

The current static locale matrix contains 15 customer routes:

- `/vi`, `/en`, `/ko`
- `/[locale]/menu`
- `/[locale]/our-space`
- `/[locale]/about`
- `/[locale]/visit`

The future Roastery milestone adds `/[locale]/roastery`, increasing the matrix to 18 routes. Goal 1 only records that requirement; it does not add the route.

## Authoritative Inputs

Inputs are applied in this order:

1. The current source and accepted visual-QA captures define component behavior and visual composition.
2. Verified business facts supplied by the owner define customer-facing location and contact data.
3. `incoming-assets/navido` is the intake source for authentic NAVIDO media.
4. `menu.json` is a provisional menu source that is approximately 80% accurate.
5. Existing Stitch assets remain temporary fallbacks where an authentic asset is unavailable.

The Vercel preview is not a production origin. No canonical production URL, sitemap origin, or production `hreflang` URLs may be inferred until NAVIDO controls a public domain.

## Verified Business Facts

| Field | Verified value |
| --- | --- |
| Display name | NAVIDO Specialty Coffee |
| Address | 23 Khu Phố Nam Quang 1, Phú Mỹ Hưng, phường Tân Hưng, TP. Hồ Chí Minh |
| Phone and Zalo | 0368 979 361 |
| Opening hours | 07:00–22:00 every day |
| Google Maps | `https://www.google.com/maps/search/?api=1&query=NAVIDO%20Specialty%20Coffee%20Nam%20Quang%201` |
| GrabFood | `https://food.grab.com/vn/vi/restaurant/navido-coffee-roaster-delivery/5-C7WALGCHALJKRA` |
| Facebook | `https://www.facebook.com/navidocoffeetea?locale=vi_VN` |
| Instagram | `https://www.instagram.com/navidocoffee/?hl=en` |
| Email | `navidocf@gmail.com` |
| Production domain | Not yet owned or verified |

Later implementation should normalize the telephone action to `tel:+84368979361` while preserving the human-readable local format. External destinations must be centralized in site configuration rather than repeated in page components.

## Verified Brand Claims

Customer-facing copy may state the following:

- NAVIDO roasts coffee in-house at the store.
- The shop uses a commercial high-capacity coffee roaster.
- NAVIDO works with beans from multiple origins represented in its menu.
- The shop has a dedicated roaster.
- Packaged roasted beans are available to take home.
- The offer includes signature drinks, specialty coffee, a diverse food menu, an inviting space, and attentive service.

The exact roaster manufacturer, model, and batch capacity are unverified. An internal planning assumption of approximately 5–15 kg may guide image selection and layout proportions, but the value must not appear in public copy, metadata, structured data, alt text, or tests.

## Conversion Priority

The website funnel is:

`brand impression -> menu consideration -> visit information -> Google Maps or phone call`

GrabFood is a secondary ordering destination. Direct ordering, checkout, reservations, and private-room booking are deferred to a later phase.

Later analytics must distinguish clicks on Google Maps, telephone, and GrabFood. Goal 1 records the event requirement but does not select or install an analytics provider.

## Asset Baseline

The intake directory currently contains 110 files:

- 97 AVIF menu-product images;
- 6 JPG files;
- 3 JPEG files;
- 2 PNG files;
- 2 WebP files.

Available authentic groups include the primary logo, exterior and entrance photography, garden/pond imagery, seating and private-room imagery, a coffee-table photograph, a bakery photograph, a photographed brunch menu, and menu-product images.

The collection does not yet include verified photography of the roasting machine, roasting process, dedicated roaster, or packaged beans. The future Roastery page therefore uses clearly registered temporary imagery until authentic replacements arrive. Random third-party web imagery is prohibited unless its license and provenance are documented.

Goal 1 must produce an asset manifest containing, for every accepted file:

- stable asset ID;
- intake path and proposed public path;
- content group;
- pixel dimensions and file format;
- intended page/section;
- alt-text subject;
- crop recommendation;
- authenticity status;
- replacement status;
- source/provenance note.

Assets are not copied into `public` until the later page-specific milestone consumes them.

## Menu Baseline

`menu.json` remains immutable source input and may be used provisionally. All `MOCK_BEANS` products and any item whose public identity contains `Mock` must be excluded from customer-facing output.

The current normalized data and anomaly report remain useful for traceability, but later menu work adds an explicit publication status:

- `draft`: imported but not approved for publication;
- `verified`: allowed on customer pages;
- `hidden`: intentionally excluded without deleting source traceability.

Until the owner supplies an official replacement menu, non-mock items from `menu.json` may be treated as provisional publishable content. The UI must state that availability and prices can change. Direct edits to `menu.json` remain prohibited.

## Localization Baseline

Vietnamese, English, and Korean remain required. The accepted quality target is professional, brand-aware translation rather than literal machine translation.

Vietnamese is the editorial source. English and Korean copy must preserve meaning, product terminology, tone, navigation parity, metadata parity, and action clarity. Menu product names may retain established original-language names when translation would make ordering less reliable.

Goal 1 records existing message-key coverage and identifies missing keys. Copywriting and translation changes belong to their page-specific milestones, followed by a final linguistic QA gate.

## Baseline Evidence

The accepted captures under `artifacts/visual-qa` remain regression evidence for Home, Menu, Our Space, About, Visit, and the shared shell at 1440×900, 768×1024, and 390×844.

Goal 1 must produce a machine-readable baseline report recording:

- route inventory;
- existing screenshot paths;
- expected page landmarks and section identifiers;
- image counts where currently asserted by tests;
- known temporary content;
- existing unit/component/E2E coverage;
- commands required to reproduce the baseline.

Later milestones may update accepted screenshots only when visible presentation changes. Each replacement must record the reason and retain comparable viewport coverage.

## Goal 1 Deliverables

1. Updated `docs/missing-content.md` separating resolved facts, provisional inputs, and remaining media/domain gaps.
2. `docs/navido-content-source-of-truth.md` containing verified business facts, approved brand claims, prohibited claims, external destinations, and menu publication rules.
3. `docs/asset-inventory.md` and a machine-readable asset manifest covering all 110 intake files.
4. `artifacts/visual-qa/baseline.json` describing current routes, screenshots, page landmarks, and verification commands.
5. Tests for manifest validation, mock-menu exclusion, site-config data shape, and baseline route completeness.
6. No customer-visible redesign or new Roastery route in this milestone.

## Acceptance Criteria

Goal 1 is complete when:

- every verified fact above exists once in the source-of-truth document and is represented by a typed implementation input or a scheduled downstream field;
- every intake asset appears exactly once in the manifest and its file exists;
- missing Roastery media and the missing production domain remain explicit unresolved items;
- mock menu products are identified by deterministic policy rather than hand-maintained display exceptions;
- all 15 existing localized routes and their baseline evidence are recorded;
- baseline validation, lint, typecheck, unit/component tests, E2E tests, and production build pass;
- no accepted page composition changes unintentionally;
- the worktree contains no unrelated edits.

## Downstream Milestones

Goal 1 feeds the remaining approved sequence:

1. Visit conversion and verified business information.
2. Authentic asset replacement on existing pages.
3. Menu publishing and browsing improvements.
4. Brand-copy expansion on Home and About.
5. The distinctive Roastery page and navigation entry.
6. Professional localization, structured data, accessibility, performance, analytics, and release QA.

Each downstream milestone receives its own reviewed spec and implementation plan before code changes begin.
