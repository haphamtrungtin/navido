# Home Visual QA

Captured 2026-09-03 from the local Next.js server for `/vi`, `/en`, and `/ko`.

## Reference Composition Check

| Expected editorial element                        | Playwright evidence                                                                                             | Result |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------ |
| Image-led hero remains visible at first paint     | The NAVIDO H1 is in the viewport and the hero background resolves to `home-cafe-interior.jpg` in every capture. | Pass   |
| Rich Home composition remains at every breakpoint | Every route renders exactly four main sections: hero, introduction, signature highlights, and visit invitation. | Pass   |
| Editorial imagery is present                      | Six Home images decode successfully after their intentional lazy-load sequence.                                 | Pass   |
| Desktop, tablet, and mobile do not overflow       | Document and every main section report `scrollWidth <= viewport width` for all nine runs.                       | Pass   |
| Captures are rendered rather than blank           | Bitmap sampling found 343-453 distinct sampled colors and 620-625 non-paper samples in each 25x25 grid.         | Pass   |

## Capture Matrix

| Locale     | Desktop 1440x900                                          | Tablet 768x1024 (derived)                                | Mobile 390x844                                          |
| ---------- | --------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------- |
| Vietnamese | `vi-desktop-1440x900.png` (453 colors, 625/625 non-paper) | `vi-tablet-768x1024.png` (400 colors, 623/625 non-paper) | `vi-mobile-390x844.png` (347 colors, 620/625 non-paper) |
| English    | `en-desktop-1440x900.png` (450 colors, 625/625 non-paper) | `en-tablet-768x1024.png` (394 colors, 623/625 non-paper) | `en-mobile-390x844.png` (345 colors, 621/625 non-paper) |
| Korean     | `ko-desktop-1440x900.png` (450 colors, 624/625 non-paper) | `ko-tablet-768x1024.png` (393 colors, 625/625 non-paper) | `ko-mobile-390x844.png` (343 colors, 621/625 non-paper) |

## Discrepancy Log

No composition, image-load, blank-render, or horizontal-overflow discrepancy was detected by the nine-run Playwright matrix. The captures use the approved temporary Stitch exports, so their photography remains an intentional placeholder difference already tracked in `docs/missing-content.md`.

The sandbox image viewer itself cannot open local PNGs because of a `CreateProcessWithLogonW` error. The visual gate is therefore evidenced by the committed screenshots, deterministic Playwright DOM and overflow assertions in `tests/e2e/home-visual.spec.ts`, and the bitmap samples above.
