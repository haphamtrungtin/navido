# Missing NAVIDO Content

## Resolved business facts

Display name, address, opening hours, phone/Zalo, Google Maps, GrabFood, Facebook,
Instagram, and email are verified in the
[NAVIDO Content Source of Truth](navido-content-source-of-truth.md) and represented
in `src/lib/business-profile.ts`. Goal 2 will wire these facts into customer pages;
the current Visit configuration and its localized pending states remain unchanged
in Goal 1.

## Provisional inputs

`menu.json` is an immutable provisional source at approximately 80% accuracy.
Non-mock records classify as `draft`; mock records classify as `hidden`. Goal 1
records this publication policy without changing rendered menu items. See the
[menu review](menu-review.md) for source anomalies and traceability. Availability
and prices remain provisional until an official menu replaces this source.

## Remaining launch gaps

- Verified production domain.
- Authentic photography of the roaster machine.
- Authentic photography of the roasting process.
- Authentic photography of the roasting team.
- Authentic photography of packaged beans.

Canonical URLs, language alternates, and sitemap entries remain omitted until a
verified production origin is supplied. `initialVisitBusinessConfig.siteUrl`
remains `null`; a preview, localhost, or deployment environment must not establish
a production domain.

## Temporary Stitch placeholders

Every file listed in `public/images/stitch/manifest.json` is a temporary export from
the approved Stitch project `11656008883608654946`. It is visual scaffolding, not
verified NAVIDO photography. Authentic owner-supplied media is already recorded in
the [asset inventory](asset-inventory.md). Tasks 3–6 replace assets page by page;
Goal 1 preserves the accepted page composition and existing public images. The
reproducible placeholder source manifest is in `scripts/download-stitch-assets.mjs`.

- `home-*.jpg`: Home composition placeholders.
- `menu-*.jpg`: Menu composition placeholders.
- `space-*.jpg`: Our Space composition placeholders.
- `about-*.jpg`: About composition placeholders.
- `visit-exterior.jpg`: Visit exterior placeholder.
- `visit-map-placeholder.jpg`: visual treatment only; it must not establish a location
  or be used as a directions target.
