# Home Visual QA

Captured 2026-09-03 from the local Next.js server at each localized Home route.

| Locale     | Desktop                   | Tablet (derived)         | Mobile                  |
| ---------- | ------------------------- | ------------------------ | ----------------------- |
| Vietnamese | `vi-desktop-1440x900.png` | `vi-tablet-768x1024.png` | `vi-mobile-390x844.png` |
| English    | `en-desktop-1440x900.png` | `en-tablet-768x1024.png` | `en-mobile-390x844.png` |
| Korean     | `ko-desktop-1440x900.png` | `ko-tablet-768x1024.png` | `ko-mobile-390x844.png` |

The desktop composition uses an immersive image-led hero, a two-column introduction, a three-column product sequence, and an asymmetric visit invitation. Tablet derives a single editorial grid with reduced spans; mobile stacks the same content without omitting sections.

The screenshot viewer was unavailable in this Windows sandbox (`CreateProcessWithLogonW` error), so direct pixel-by-pixel inspection against Stitch could not be performed in this environment. Captures were generated successfully for all nine route/viewport combinations, and functional browser coverage confirms each localized route, landmark, H1, and Menu/Visit target. A later visual pass should inspect crop position and text wrapping against the Stitch reference before release.
