# Menu Stitch Reference

Tracked from Stitch project `11656008883608654946` on 2026-09-07.

| Variant | Stitch title              | Screen ID                          | Device  | Source dimensions | Retained files                                                                                               |
| ------- | ------------------------- | ---------------------------------- | ------- | ----------------- | ------------------------------------------------------------------------------------------------------------ |
| Desktop | `Menu — NAVIDO (Desktop)` | `5013a6010d944221971635a3093da7ca` | Desktop | 2560 x 15916      | [`menu-navido-desktop.png`](menu-navido-desktop.png), [`menu-navido-desktop.html`](menu-navido-desktop.html) |
| Mobile  | `Menu — NAVIDO (Mobile)`  | `2145dbab5e144871999f7ecf5616dafc` | Mobile  | 780 x 7298        | [`menu-navido-mobile.png`](menu-navido-mobile.png), [`menu-navido-mobile.html`](menu-navido-mobile.html)     |

These two screens are the implemented Menu baseline. The corresponding NAVIDO output captures and measurements are retained under [`artifacts/visual-qa/menu`](../../visual-qa/menu/comparison.md).

The implementation follows the reference content composition while retaining the existing shared site shell and all 130 authoritative menu rows. Those are intentional product constraints rather than unimplemented visual work.

The retained exports are design evidence only. Stitch menu labels and business details are not verified source data; implementation must continue to render the normalized repository menu and must not introduce unsupported facts.
