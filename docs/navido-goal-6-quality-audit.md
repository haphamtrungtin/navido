# NAVIDO Goal 6 — SEO, localization, accessibility, and QA audit

Date: 2026-09-19

## Scope

The audit covers all six localized page families (`home`, `menu`, `our-space`, `about`, `roastery`, and `visit`) in Vietnamese, English, and Korean. It preserves the existing editorial layout and uses only verified NAVIDO business facts.

## Implemented

- Added locale-aware Open Graph metadata (`vi_VN`, `en_US`, `ko_KR`) and a Twitter summary card through the existing metadata builder.
- Added a `CafeOrCoffeeShop` JSON-LD contract to the shared locale layout. It includes the verified address, phone, email, opening hours, Maps URL, and verified social profiles. Unverified production URLs are omitted.
- Added a 15-case discovery/accessibility Playwright contract covering the five non-home route families in all three locales. It asserts HTTP 200, document language, one H1, title/description, JSON-LD presence, non-empty image alt text, safe external links, and no horizontal overflow.
- Marked the Roastery hero image as a priority image. Menu mobile editorial media retains its existing eager contract; the desktop introduction remains lazy by design and by regression test.

## Evidence

- `pnpm test`: 26 files, 88 tests passed.
- `pnpm typecheck`: passed.
- `pnpm lint`: passed.
- `pnpm format:check`: passed.
- `pnpm build`: passed; 23 static outputs, including all 18 localized page routes plus robots/sitemap outputs.
- `pnpm test:e2e --reporter=dot`: 167 tests passed.
- Visual artifacts were refreshed by the regression run; Roastery evidence remains in `artifacts/visual-qa/roastery/`.

## Explicit release prerequisites

- `businessProfile.siteUrl` remains `null` because no production domain has been verified. Until NAVIDO provides the final domain, canonical URLs, hreflang absolute URLs, and the sitemap URL remain intentionally disabled. The Vercel preview must not be promoted to a canonical origin.
- Next.js still reports advisory LCP messages for several existing lazy editorial images (Menu, Our Space, and Visit placeholders). They do not fail the contracts, but should be rechecked with a production Lighthouse/Web Vitals run after the final hero/media assets are confirmed.
- Roastery machine/process/team/packaging imagery remains explicitly temporary and replaceable.
