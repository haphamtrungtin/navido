# Visual QA Index

This index inventories every final PNG capture committed under
`artifacts/visual-qa`. The page captures were accepted by their page visual gates;
the final production matrix on 2026-09-05 confirmed the same route families at
desktop and mobile widths. Documentation-only handoff changes did not alter rendered
presentation, so no duplicate captures were created.

## Tracked Stitch References

The implemented Menu baseline is retained separately under
[`artifacts/stitch-references/menu`](../stitch-references/menu/README.md). Its
desktop and mobile exports are the source references for the Menu output captures
below. The comparison record documents the shared-shell and full-source-data
constraints applied during implementation.

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

## Goal 1 baseline verification — 2026-09-18

The baseline handoff passed deterministic validation, repository formatting,
lint, typecheck, all 66 unit/component tests in 16 files, the production build,
and all 98 Chromium E2E/visual-contract tests (8 workers, 1.6 minutes).

Commands ran from `D:/Projects/navido/.worktrees/navido-website` using the installed
pnpm executable. The process PATH included its directory. Because Corepack is not
installed, an ignored `task-5-runtime/corepack.cmd` shim forwarded
`corepack pnpm <args>` to that executable, preserving the committed build and
Playwright web-server commands.

```powershell
$env:PATH = 'D:/Projects/navido/.worktrees/navido-website/.superpowers/sdd/2026-09-17-navido-goal-1-baseline/task-5-runtime;C:/Users/tinha/AppData/Local/pnpm/bin;' + $env:PATH
& 'C:/Users/tinha/AppData/Local/pnpm/bin/pnpm.CMD' exec prettier --write src/lib/business-profile.ts src/lib/asset-manifest.ts src/features/menu/domain/publication.ts src/lib/site-baseline.ts scripts/generate-asset-manifest.ts scripts/generate-visual-baseline.ts tests/unit/business-profile.test.ts tests/unit/asset-manifest.test.ts tests/unit/menu-publication.test.ts tests/unit/site-baseline.test.ts docs/navido-content-source-of-truth.md docs/asset-inventory.md docs/missing-content.md README.md package.json
& 'C:/Users/tinha/AppData/Local/pnpm/bin/pnpm.CMD' validate:baseline-content
& 'C:/Users/tinha/AppData/Local/pnpm/bin/pnpm.CMD' validate:baseline-content
& 'C:/Users/tinha/AppData/Local/pnpm/bin/pnpm.CMD' format:check
& 'C:/Users/tinha/AppData/Local/pnpm/bin/pnpm.CMD' lint
& 'C:/Users/tinha/AppData/Local/pnpm/bin/pnpm.CMD' typecheck
& 'C:/Users/tinha/AppData/Local/pnpm/bin/pnpm.CMD' test
& 'C:/Users/tinha/AppData/Local/pnpm/bin/pnpm.CMD' build
& 'C:/Users/tinha/AppData/Local/pnpm/bin/pnpm.CMD' test:e2e --config .superpowers/sdd/2026-09-17-navido-goal-1-baseline/task-5-runtime/playwright.config.ts
```

All commands exited 0. Both aggregate validations checked the immutable menu,
110-file authentic asset inventory, and 15-route visual baseline; comparing the
tracked diff before and after the second run found no change. Prettier processed
exactly the 15 plan-listed files; only the two previously unformatted Task 1
TypeScript files required formatting beyond the handoff documentation changes.

The temporary Playwright config imported the committed config and retained all
committed specs, Chromium settings, web-server behavior, and assertions. It changed
only artifact destinations: the visual specs derive their output from the working
directory, so their new captures, measurements, and comparison records went to
ignored scratch storage. SHA-256 comparisons before and after the suite confirmed
all 62 tracked visual evidence files were unchanged, including the 45 page PNGs
and 3 shared-shell PNGs. No accepted screenshot was replaced or recaptured in place.

The build generated 20 static outputs, including exactly the original 15 localized
customer routes across Home, Menu, Our Space, About, and Visit. Its prerender
manifest matched `baseline.json`; no Roastery route exists. Scope audits found no
changes to customer pages, shared components, sections, locale dictionaries, public
images, raw menu source, or generated menu artifacts. The raw menu SHA-256 remains
`A7040FE8B651E60923851798F58DADBF8C6455F68E3A6F6D4715F6FA2106F0AE`.

The development server emitted image-loading advice, color-environment warnings,
and one `Unexpected end of JSON input` message while generating `/[locale]` static
paths during the concurrent browser run. All 98 tests still passed with no retries
or skipped tests; these messages did not occur as build or test failures. Goal 1
made no customer-facing code change in response.
