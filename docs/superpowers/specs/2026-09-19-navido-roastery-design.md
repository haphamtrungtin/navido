# NAVIDO Roastery Design

**Status:** Draft for review  
**Milestone:** Goal 5 — Roastery page  
**Parent objective:** Complete the NAVIDO website incrementally while preserving the existing design, using verified business facts and real assets, improving visit conversion, and completing localization, SEO, accessibility, performance, and release QA.

## Intent and success criteria

The Roastery page makes NAVIDO's in-house roasting practice the clearest brand differentiator while helping a visitor decide to come to the store. It must feel like a deliberate feature page, not a second homepage: the shared header, footer, typography, navigation behavior, and conversion destinations remain intact, while the page body may use a darker botanical roast palette.

Success means:

- `/vi/roastery`, `/en/roastery`, and `/ko/roastery` render as statically generated pages.
- The page truthfully communicates in-house roasting, multiple origins, a dedicated roaster, signature coffee, and packaged beans available to take home.
- No public copy, metadata, structured data, or alt text invents a manufacturer, model, batch capacity, roast profile, or unverified production claim.
- Temporary roastery media is visibly marked in code/content as temporary and can be replaced by owner-supplied media without changing the page architecture.
- Visitors have direct paths to the menu, Google Maps, phone call, and the existing visit page; there is no cart, checkout, reservation, or direct bean purchase flow.
- The route is covered across three locales and desktop/tablet/mobile visual QA without regressing the existing five routes.

## Content model

The page consumes a small typed presentation model rather than embedding menu data in JSX.

### Roastery story

1. **Hero:** “Roasted in-house” story, with a strong statement that roasting happens at the store and a primary “Visit NAVIDO” CTA.
2. **Process:** three editorial steps — origins, roasting, and serving/take-home packaging. The copy describes the practice without claiming unverified machine details.
3. **Origins:** a responsive origin wall derived from public menu items in the existing `localMenuRepository`. It deduplicates origin/bean names, preserves source traceability, and excludes hidden mock products.
4. **Coffee bridge:** three current coffee/signature menu items with links to `/menu`; no duplicated prices or availability guarantees beyond the existing provisional-menu notice.
5. **Take-home beans:** a compact product strip derived from public packaged-bean menu items. It presents the items as in-store take-home options and links to the menu/visit flow, not to checkout.
6. **Visit close:** address/hours plus Maps and call actions, reusing `businessProfile` and `conversionLinks`.

The four unresolved asset groups in `docs/asset-inventory.json` remain explicit: `roaster-machine`, `roasting-process`, `roasting-team`, and `packaging`. Until owner-supplied media arrives, each slot uses a verified NAVIDO coffee/space/menu image selected for composition and has a replacement key such as `TODO: replace with roaster-machine photography` in the asset configuration, never in customer-facing prose.

## Visual direction

The shared shell remains unchanged. The Roastery body uses:

- near-black roasted-coffee background for the hero and process band;
- warm paper panels and muted botanical green accents for content blocks;
- large editorial type and generous spacing matching the current site rhythm;
- thin rules, numbered process markers, and restrained motion-free composition so the page remains accessible and fast;
- high-contrast light text on dark regions and visible keyboard focus states.

The page must not introduce a new font, animation library, image CDN, or third-party script.

## Architecture and boundaries

- Add a localized route at `src/app/[locale]/roastery/page.tsx`, following the metadata/static-param patterns of the existing pages.
- Add focused sections under `src/sections/roastery/` for hero, process, origin wall, bean strip, and visit close. Sections receive typed copy/data props and remain presentational.
- Add a small `src/features/roastery/` domain/data module that derives origins, coffee picks, and packaged beans from `localMenuRepository` and exposes stable typed selectors. It must not mutate `menu.json` or the normalized source.
- Extend `navigationItems` and all locale `Navigation` messages with the Roastery link.
- Extend `Metadata` with localized Roastery title/description and include the route in sitemap generation through the existing route-aware metadata helpers.
- Reuse `Container`, `EditorialImage`, `Eyebrow`, `TextLink`, `businessProfile`, and `conversionLinks` wherever they already express the needed behavior.
- Keep the existing `asset-manifest` missing groups unchanged; add a focused roastery media mapping with replacement status rather than pretending the missing photographs exist.

## Accessibility and responsive behavior

- Exactly one page-level H1 per locale.
- Every editorial image has localized, descriptive alt text; decorative separators are hidden from assistive technology.
- Origin and bean cards are semantic lists, not clickable divs.
- CTA links expose meaningful labels and preserve existing external-link semantics.
- At 390px width, process and product content stacks without horizontal overflow; the origin wall remains readable; CTA targets remain comfortably tappable.
- At 768px and 1440px, the hero and process sections keep the intended editorial hierarchy and do not rely on hover.

## Data and error behavior

The public repository may contain no packaged beans or no origin records in a future menu revision. The page must still render its story and CTAs; optional origin/bean sections render an intentional empty state rather than throwing. Hidden publication statuses are filtered at the selector boundary. Current menu availability/prices remain provisional and are not copied into Roastery claims.

## Verification requirements

- Unit tests cover origin deduplication, mock filtering, packaged-bean selection, and empty optional data.
- Component tests cover heading/landmark structure, TODO media labels, CTA hrefs, and external-link attributes.
- E2E tests cover all three locales, navigation reachability, menu/Maps/call destinations, and no direct-commerce controls.
- Visual tests cover desktop 1440×900, tablet 768×1024, and mobile 390×844 for Vietnamese; smoke checks cover English and Korean.
- Existing unit, component, lint, typecheck, format, build, and full E2E suites must remain green.

## Explicit non-goals

- No online ordering, cart, payment, account, reservation, or inventory system.
- No roaster manufacturer/model/capacity claim.
- No production-domain claim or structured-data address beyond the existing verified business profile.
- No unrelated redesign of Home, Menu, About, Our Space, or Visit.
