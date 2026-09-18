# NAVIDO Goal 2 Conversion Design

## Status

Approved for implementation on 2026-09-18. The owner selected the balanced conversion approach: one desktop directions CTA, a persistent mobile call/directions bar, complete footer contact details, and contextual calls to action on Home and Visit.

## Objective

Make the existing NAVIDO website useful for planning and completing a visit without redesigning it. Visitors must be able to see verified store information, call the shop, open Google Maps, order through GrabFood, and reach NAVIDO's verified social channels from appropriate points in the current editorial experience.

## Scope

Goal 2 updates the shared shell, Home, and Visit across Vietnamese, English, and Korean. It does not add routes, replace imagery, publish Roastery content, enable reservations or direct commerce, add analytics, or establish a production domain.

The accepted five-page composition, typography, spacing system, color tokens, navigation order, and editorial visual language remain authoritative. Goal 2 may change text wrapping and add the approved conversion controls, so affected screenshots must be reviewed rather than blindly overwritten.

## Source of truth and data flow

`src/lib/business-profile.ts` remains the only source for identity, address, opening hours, phone numbers, email, site URL, Maps, GrabFood, Facebook, Instagram, and Zalo destinations. Components and locale dictionaries must not duplicate these values.

The localized layout passes verified profile data and external destinations into the shared shell. Home and Visit import the same source directly. Locale dictionaries contain only translatable labels, descriptions, and accessible names.

The public configuration is non-null for all verified fields except `siteUrl`. Metadata continues to receive `siteUrl: null`, so canonical URLs, language alternates, sitemap entries, and production-origin claims remain disabled until a later verified-domain milestone.

## Shared shell

### Desktop header

At the existing `md` desktop breakpoint, add one visually restrained Google Maps CTA after the language switcher. Its localized label is equivalent to “Directions.” It opens the verified Maps destination in a new tab with safe external-link attributes. Existing navigation labels, ordering, dimensions, sticky positioning, and mobile menu trigger remain unchanged.

### Mobile conversion bar

On viewports below `md`, show a fixed two-action bar at the bottom of every localized page:

- Call uses `tel:+84368979361` and the localized equivalent of “Call.”
- Directions opens the verified Google Maps URL in a new tab.

The two actions have equal weight, clear focus styles, and at least a 44px touch target. The bar uses the current paper, ink, espresso, and rule tokens rather than introducing a new visual system. The page body receives responsive bottom padding so content and footer controls are never obscured.

The bar is not rendered while the full-screen mobile navigation dialog is open. `MobileNavigation` owns this state and renders the bar alongside the navigation trigger, avoiding global events or duplicated menu state. The dialog's existing focus trap, inert handling, Escape behavior, and focus restoration must continue to pass.

### Footer

Replace the pending sentence with a responsive editorial footer containing:

- `NAVIDO Specialty Coffee`;
- verified address;
- `07:00–22:00` plus a localized “daily” label;
- callable display phone;
- email link;
- Maps, GrabFood, Facebook, Instagram, and Zalo links.

External destinations open in a new tab with safe attributes. Phone and email use `tel:` and `mailto:` respectively. The footer remains compact and typographically consistent; it must not resemble a dense directory or sales panel.

## Home page

Keep all four existing sections and their grid/image composition. In the location invitation:

- replace pending-location copy with professionally localized copy naming the Phú Mỹ Hưng setting, verified address, and daily opening window;
- keep the existing internal link to `/visit`;
- add no extra image or section.

The hero's existing Menu and Visit links remain unchanged. The global header/mobile/footer controls provide direct conversion without repeating Maps, phone, and GrabFood inside every Home section.

## Visit page

Keep the introduction/details composition and current exterior/map placeholder images.

### Introduction

Replace all pending language with professional localized copy inviting guests to NAVIDO and explaining that the page contains directions, hours, contact, and ordering options. Metadata title and description must likewise describe the real store rather than unconfirmed information.

### Store information

Render verified address, localized daily hours, and display phone. The address links to Google Maps; the phone uses the E.164 `tel:` target while displaying `0368 979 361`.

### Actions

Provide Maps, Call, GrabFood, Zalo, Instagram, Facebook, and email. Maps, GrabFood, Zalo, and social destinations open externally; Call and email use their native schemes. The list uses the current divided-row presentation and localized action labels.

### Map card

Keep `visit-map-placeholder.jpg` as a visual treatment only. Make the figure/card an accessible link to the verified Google Maps destination and replace the pending caption with localized text that clearly says it opens Google Maps. It must not embed Google Maps, use an iframe, add cookies, claim the placeholder is a real map, or require an API key.

## Localization

Vietnamese is the source editorial voice. English and Korean must be natural professional translations, not literal word substitutions. Brand names, address, phone, email, URLs, `07:00–22:00`, and platform names remain invariant. The “daily” qualifier and all action/accessibility labels are localized.

Remove customer-facing “pending” copy for facts verified in Goal 1. Pending keys may be deleted once no production consumer or test references them. No untranslated fallback text may appear in any locale.

## Accessibility and interaction requirements

- All controls have descriptive accessible names in the active locale.
- Keyboard focus remains visible.
- External links use `target="_blank" rel="noreferrer"`; native phone/email links stay in the current context.
- Touch targets are at least 44px.
- The fixed mobile bar does not cover content, footer links, or browser-safe-area space.
- The mobile navigation retains dialog semantics, focus trapping, Escape close, background inertness, and trigger focus restoration.
- The map placeholder alt text describes a NAVIDO directions visual, never a literal map location.

## Failure and resilience behavior

Verified destination constants are required at build time and covered by schema/unit tests. Goal 2 does not reintroduce nullable pending UI for verified fields. If a future destination changes, it is updated once in `business-profile.ts` and all consumers receive the new value.

External services may be unavailable after navigation; the website does not attempt client-side health checks or substitute unverified URLs. Links remain ordinary, progressively enhanced anchors, and no conversion action requires JavaScript except opening/closing the existing mobile navigation.

## Analytics and privacy

No analytics, tracking parameters, external map embeds, cookies, or third-party scripts are added. This milestone establishes semantic link contracts so analytics can be added later without changing destinations or visual design.

## Testing and acceptance criteria

### Unit and component coverage

- The business profile exposes all verified data and correctly formed `tel:`/email/external destinations without duplication.
- Header renders the desktop Maps CTA.
- Mobile navigation renders the Call/Directions bar when closed and not when open; existing accessibility behaviors remain intact.
- Footer renders every verified fact and destination with correct link semantics.
- Visit information, actions, and map card render the correct verified values and hrefs.
- Locale dictionaries have matching shapes and contain no obsolete pending copy in affected sections.

### Browser coverage

For VI, EN, and KO:

- Home location copy contains verified store information and links to Visit.
- Visit contains no pending markers, and all conversion destinations are correct.
- Header directions CTA is visible at desktop width.
- Mobile Call/Directions bar is visible, does not obscure content, and disappears while the menu dialog is open.
- Footer details and links are keyboard reachable.
- No horizontal overflow, clipped labels, or inaccessible focus state appears at 390×844, 768×1024, or 1440×900.

### Regression gates

Run deterministic baseline-content validation, formatting, lint, typecheck, full unit/component tests, production build, and the complete E2E suite. Capture new Goal 2 screenshots separately or update accepted visual evidence only after explicit visual comparison against Goal 1. The five existing routes in each locale remain the entire customer-facing route set, and `/roastery` remains out of scope.

## Explicit exclusions

- No online checkout, bean ordering, cart, account, reservation, or table booking.
- No embedded map or third-party tracking.
- No new Roastery page or navigation item.
- No replacement of Stitch imagery with owner assets.
- No production domain, canonical-origin, sitemap, or structured-data rollout.
- No unrelated component refactor or visual redesign.

## Completion evidence

Goal 2 is complete only when all required links and facts are present across three locales, automated checks pass, responsive browser behavior is verified, customer route count remains 15, visual changes are reviewed against the Goal 1 baseline, and the tracked worktree is clean.
