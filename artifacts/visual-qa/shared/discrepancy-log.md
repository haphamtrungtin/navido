# Shared Navigation Visual QA

Captured from the verified production build on 2026-09-03.

| Capture                              | Evidence                                                                                        | Result                                                                                       |
| ------------------------------------ | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `desktop-1440x900.png`               | PNG dimensions 1440x900; document width 1440; header bottom rule 1px                            | Desktop navigation remains on one wide row with no horizontal overflow.                      |
| `mobile-390x844.png`                 | PNG dimensions 390x844; document width 390; header bottom rule 1px                              | Closed mobile header fits the viewport without overflow.                                     |
| `mobile-390x844-navigation-open.png` | PNG dimensions 390x844; dialog present after menu activation; focus moved to the Trang chu link | The full navigation panel opens at the mobile viewport and preserves visible keyboard focus. |

## Discrepancies and limitations

- No viewport overflow, missing border, or focus-placement discrepancy was detected by the rendered DOM checks.
- The detached development server could not complete its HMR WebSocket handshake in this environment, leaving the initial client island unhydrated for capture. The production build on port 3001 hydrated correctly: the trigger changed from `aria-expanded=false` to `aria-expanded=true` and exposed one dialog. Production captures replace the affected development captures.
- Direct raster inspection through the local image viewer was blocked by the Windows sandbox (`CreateProcessWithLogonW` error 1327). Screenshot dimensions, rendered DOM state, border width, viewport width, focus placement, and overflow were checked programmatically; manual design comparison remains a final handoff item when that viewer is available.
