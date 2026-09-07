# Visual QA Index

This index inventories every final PNG capture committed under
`artifacts/visual-qa`. The page captures were accepted by their page visual gates;
the final production matrix on 2026-09-05 confirmed the same route families at
desktop and mobile widths. Documentation-only handoff changes did not alter rendered
presentation, so no duplicate captures were created.

## Tracked Stitch References

The newer Menu baseline is retained separately under
[`artifacts/stitch-references/menu`](../stitch-references/menu/README.md). Its
desktop and mobile exports were added after the current Menu implementation gate;
the output captures below therefore document the existing implementation, not a
completed comparison against that newer pair.

These are NAVIDO output captures. The approved Stitch project informed the earlier
page gates, but its reference images and stable page locators are not retained in
this handoff. The linked comparison records therefore document rendered-contract
verification and measurements, not an auditable retained Stitch-to-output pairwise
comparison.

## Shared Shell

| Capture                                                                | Evidence                            |
| ---------------------------------------------------------------------- | ----------------------------------- |
| [Desktop 1440x900](shared/desktop-1440x900.png)                        | Wide header and desktop navigation. |
| [Mobile 390x844](shared/mobile-390x844.png)                            | Closed mobile header.               |
| [Mobile navigation 390x844](shared/mobile-390x844-navigation-open.png) | Open dialog and focus placement.    |

See [shared discrepancy log](shared/discrepancy-log.md) for the production-capture
decision and limitations recorded when the shell was accepted.

## Pages

Each page has three locale captures at desktop, tablet, and mobile dimensions. The
tablet captures are verification of the derived layout; there is no supplied tablet
Stitch reference.

| Page      | Comparison record                     | Vietnamese                                                                                                                          | English                                                                                                                             | Korean                                                                                                                              |
| --------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Home      | [comparison](home/comparison.md)      | [desktop](home/vi-desktop-1440x900.png), [tablet](home/vi-tablet-768x1024.png), [mobile](home/vi-mobile-390x844.png)                | [desktop](home/en-desktop-1440x900.png), [tablet](home/en-tablet-768x1024.png), [mobile](home/en-mobile-390x844.png)                | [desktop](home/ko-desktop-1440x900.png), [tablet](home/ko-tablet-768x1024.png), [mobile](home/ko-mobile-390x844.png)                |
| Menu      | [comparison](menu/comparison.md)      | [desktop](menu/vi-desktop-1440x900.png), [tablet](menu/vi-tablet-768x1024.png), [mobile](menu/vi-mobile-390x844.png)                | [desktop](menu/en-desktop-1440x900.png), [tablet](menu/en-tablet-768x1024.png), [mobile](menu/en-mobile-390x844.png)                | [desktop](menu/ko-desktop-1440x900.png), [tablet](menu/ko-tablet-768x1024.png), [mobile](menu/ko-mobile-390x844.png)                |
| Our Space | [comparison](our-space/comparison.md) | [desktop](our-space/vi-desktop-1440x900.png), [tablet](our-space/vi-tablet-768x1024.png), [mobile](our-space/vi-mobile-390x844.png) | [desktop](our-space/en-desktop-1440x900.png), [tablet](our-space/en-tablet-768x1024.png), [mobile](our-space/en-mobile-390x844.png) | [desktop](our-space/ko-desktop-1440x900.png), [tablet](our-space/ko-tablet-768x1024.png), [mobile](our-space/ko-mobile-390x844.png) |
| About     | [comparison](about/comparison.md)     | [desktop](about/vi-desktop-1440x900.png), [tablet](about/vi-tablet-768x1024.png), [mobile](about/vi-mobile-390x844.png)             | [desktop](about/en-desktop-1440x900.png), [tablet](about/en-tablet-768x1024.png), [mobile](about/en-mobile-390x844.png)             | [desktop](about/ko-desktop-1440x900.png), [tablet](about/ko-tablet-768x1024.png), [mobile](about/ko-mobile-390x844.png)             |
| Visit     | [comparison](visit/comparison.md)     | [desktop](visit/vi-desktop-1440x900.png), [tablet](visit/vi-tablet-768x1024.png), [mobile](visit/vi-mobile-390x844.png)             | [desktop](visit/en-desktop-1440x900.png), [tablet](visit/en-tablet-768x1024.png), [mobile](visit/en-mobile-390x844.png)             | [desktop](visit/ko-desktop-1440x900.png), [tablet](visit/ko-tablet-768x1024.png), [mobile](visit/ko-mobile-390x844.png)             |

The corresponding `metrics.json` files are rendered-DOM measurements for each page
gate, not extra screenshots. See [page comparison summary](page-comparison-summary.md)
for the final evidence interpretation.
