# Missing NAVIDO Content

## Temporary Stitch placeholders

Every file listed in `public/images/stitch/manifest.json` is a temporary export from
the approved Stitch project `11656008883608654946`. It is visual scaffolding, not
verified NAVIDO photography, and must be replaced with licensed NAVIDO media before
publication. The reproducible source manifest is in `scripts/download-stitch-assets.mjs`.

- `home-*.jpg`: Home composition placeholders.
- `menu-*.jpg`: Menu composition placeholders.
- `space-*.jpg`: Our Space composition placeholders.
- `about-*.jpg`: About composition placeholders.
- `visit-exterior.jpg`: Visit exterior placeholder.
- `visit-map-placeholder.jpg`: visual treatment only; it must not establish a location
  or be used as a directions target.

## Business facts awaiting verification

- Street address
- Opening hours
- Phone number
- Instagram URL
- Facebook URL
- Google Maps destination URL
- Grab destination URL
- Public production domain

The site must render localized pending states for these values and must not emit phone,
maps, ride-hailing, or social links until the corresponding values are verified.
