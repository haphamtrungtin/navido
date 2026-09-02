# NAVIDO Website Design

**Date:** 2026-09-02  
**Status:** Approved in chat; awaiting written-spec review  
**Stitch project:** `NAVIDO Digital Editorial Experience` (`11656008883608654946`)

## Objective

Build a production-ready informational website for NAVIDO Specialty Coffee from the supplied Stitch design and raw `menu.json`. The site provides five pages in Vietnamese, English, and Korean, preserves the raw menu source, and is suitable for Vercel deployment.

The first release includes Home, Menu, Our Space, About, and Visit. It excludes authentication, commerce, checkout, reservations, ordering logic, forms, CMS integration, databases, and administrative features.

## Source Policy

Source priority is:

1. Stitch for visual design, responsive intent, components, and page composition.
2. `menu.json` for items, categories, prices, ordering, and source identity.
3. Supplied real NAVIDO assets for authentic photography.
4. The master prompt for architecture, behavior, and quality requirements.

The workspace currently contains no verified NAVIDO photography. The exported Stitch images will therefore be used as temporary visual placeholders so the implementation can preserve the reference composition. Each will be documented for later replacement.

Stitch includes unsupported address, hours, phone, social, Maps, and Grab details. These values must not be treated as business facts. The implementation will use localized "information pending" content and non-actionable states until verified URLs and details are supplied.

Desktop and mobile Stitch screens occasionally contain different sections. The implementation will preserve content parity across viewports by using the richer page composition and adapting only its responsive layout.

## Technology

- Current stable Next.js 16 release with App Router and strict TypeScript.
- React versions selected by the current Next.js scaffold.
- Tailwind CSS 4 using its PostCSS integration and CSS-first theme tokens.
- `next-intl` for locale-prefixed App Router routes and localized navigation.
- Zod for raw and normalized menu schemas.
- Vitest and React Testing Library for unit and component tests.
- Playwright for route, interaction, responsive, and visual checks.
- ESLint and Prettier.
- `pnpm` for package management and scripts.

Server Components are the default. Client Components are limited to the mobile navigation, language switcher, and interactive sticky menu-category navigation.

## Architecture

The application is organized around four boundaries:

1. **Routing and presentation:** `src/app/[locale]` and focused page sections render localized static pages.
2. **Shared UI:** `src/components` contains the header, footer, layout primitives, typography, links, image treatments, and interactive navigation controls.
3. **Internationalization:** `src/i18n` centralizes locales, route configuration, navigation wrappers, request configuration, dictionaries, fallback selection, and formatting.
4. **Menu domain:** `src/features/menu` owns raw validation, normalization, anomaly detection, normalized schemas, data generation, the review report, and a read-only repository.

Pages never import or parse `menu.json`. They consume a small read-only repository interface that returns normalized categories and items. The local repository can later be replaced by a CMS or API implementation without changing page components.

Recurring Stitch values become CSS custom properties and Tailwind theme tokens. Page-specific components compose shared primitives without introducing a general-purpose UI kit.

## Menu Pipeline

The menu flow is:

`menu.json` -> raw Zod schema -> normalization and anomaly detection -> normalized data and review report -> repository -> localized Server Components.

The raw file remains unchanged. A deterministic validation/generation command reads all 130 records and produces normalized build input plus a human-readable report. The generator:

- preserves `sourceRow`, price, source name, and source category identity;
- creates stable item and category IDs;
- normalizes whitespace and clearly documented spelling errors in display data only;
- separates supported Vietnamese, English, and Korean name fragments;
- generates missing translations conservatively and flags them for review;
- detects exact and likely duplicates;
- flags mixed-language names, suspicious spellings, missing translations, malformed records, and the three `MOCK_BEANS` records;
- sorts categories by source order and items deterministically;
- merges the two raw Extras category codes only in the display-domain category while retaining their raw traceability;
- formats prices as Vietnamese dong through a centralized formatter.

Localized menu-name fallback is: requested locale, Vietnamese, English, then normalized source display name. Any fallback or generated translation keeps `needsReview: true` and an explanatory review note.

Structural errors fail validation and the production build. Recoverable content anomalies remain renderable and are recorded in the review report.

## Internationalization

Supported locales are `vi`, `en`, and `ko`, with Vietnamese as default. Routes are locale-prefixed:

- `/vi`, `/en`, `/ko`
- `/[locale]/menu`
- `/[locale]/our-space`
- `/[locale]/about`
- `/[locale]/visit`

The root route redirects to `/vi`. Invalid locale segments produce not-found behavior. The language switcher preserves the equivalent page and never uses country flags.

Navigation, controls, headings, page copy, metadata, alt text, menu names, and placeholder messages are localized. Static generation enumerates all locale routes. Each page emits localized canonical and alternate-language metadata.

Noto Sans and Noto Sans KR provide Vietnamese and Korean glyph coverage.

## Visual System

The implementation follows the Stitch `Quietude Editorial` system:

- warm ivory background and paper-like tonal surfaces;
- soft charcoal primary text, restrained espresso and botanical accents;
- Noto Sans typography with light display weights and generous body leading;
- 1200px maximum content width;
- 12-column desktop, 6-column tablet, and 2-column mobile grid intent;
- 24px gutters, 20px mobile margins, 8px spacing rhythm, and approximately 120px major section gaps;
- thin low-contrast rules instead of shadows;
- sharp image and section framing with only subtle control radii;
- large editorial imagery and asymmetrical placement;
- slow, restrained transitions that respect `prefers-reduced-motion`.

Desktop uses a wide top navigation. Mobile uses an accessible menu trigger and full navigation panel. Focus states, semantic landmarks, meaningful labels, correct heading order, and adequate contrast are required.

## Page Composition

### Home

An immersive cafe hero, brand introduction, signature highlights, and location invitation. The richer mobile reference supplies the signature and visit content; these sections are adapted into the desktop grid rather than removed.

### Menu

An editorial header, sticky category navigation, all normalized menu categories and items, and restrained image breaks. The page uses source data rather than the small illustrative menu subset shown in Stitch.

### Our Space

A hero followed by the richer editorial sequence: morning light, a quiet table, downstairs coffee area, upstairs space, and a visit callout.

### About

An introduction followed by Coffee, Food, Space, and Community themes in an asymmetrical editorial grid.

### Visit

Location, hours, contact, directions, Grab, exterior imagery, and a map treatment. Until facts and URLs are verified, information is explicitly pending and action controls are disabled or rendered as non-links.

## Responsive Behavior

Desktop and mobile references are authoritative at their supplied sizes. Tablet behavior is derived consistently from the Stitch grid system because no tablet references exist.

Content remains consistent across breakpoints. Desktop uses multi-column editorial layouts and large negative space. Tablet reduces column spans while preserving hierarchy. Mobile stacks content, uses horizontal overflow only for the intentional category scroller, and replaces desktop navigation with the menu panel.

Images reserve stable aspect ratios and use explicit responsive sizes and object positions. Layouts must have no accidental horizontal overflow, clipping, overlap, broken assets, or cumulative layout shift.

## Error Handling

- Invalid raw or normalized menu structure produces actionable validation errors and fails the build.
- Recoverable menu anomalies are surfaced in the review report and `needsReview` metadata.
- Invalid locale routes return not found.
- Missing verified business facts render localized pending states without fabricated actions.
- Missing image files render intentional placeholders and are listed in the asset report.
- External links are emitted only when their URLs are verified inputs.

## Testing And Verification

Unit and component coverage includes:

- raw schema validation;
- normalization and stable IDs;
- category and item sorting;
- exact and likely duplicate detection;
- suspicious and mixed-language data detection;
- locale selection and fallback;
- VND price formatting;
- language switching that preserves the route;
- mobile navigation behavior;
- sticky category navigation behavior.

Playwright covers all five pages in all three locales, locale switching, representative navigation, accessibility basics, and responsive layouts.

Every substantial shared UI and each page follows a visual loop at 1440x900, 768x1024, and 390x844. Screenshots and comparison notes are stored under `artifacts/visual-qa/<page>/<viewport>/`. Desktop and mobile are compared directly with Stitch; tablet is recorded as a derived layout. Up to three correction rounds address material discrepancies before proceeding to the next page.

Final verification runs:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
```

## Delivery Sequence

1. Foundation: scaffold, tooling, tokens, locale routing, shared layout, menu pipeline, and focused tests.
2. Verify shared desktop and mobile navigation and footer.
3. Implement and visually verify Home.
4. Implement and visually verify Menu.
5. Implement and visually verify Our Space.
6. Implement and visually verify About.
7. Implement and visually verify Visit.
8. Run cross-page, locale, responsive, accessibility, data, and production-build validation.
9. Complete README, menu review report, missing-content report, screenshot index, and page comparison summary.

## Known Inputs Still Missing

- Verified NAVIDO photography.
- Verified street address.
- Verified opening hours.
- Verified phone number.
- Verified Instagram and Facebook URLs.
- Verified Google Maps destination URL.
- Verified Grab destination URL.
- Confirmed public production domain for canonical URLs.

These omissions do not block the foundation or page layout implementation. They remain explicit placeholders and handoff items.
