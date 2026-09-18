# NAVIDO Goal 2 Conversion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire verified NAVIDO store facts and balanced visit-conversion actions into the existing shared shell, Home, and Visit experiences in Vietnamese, English, and Korean without redesigning the accepted site.

**Architecture:** Keep `business-profile.ts` as the only source of invariant facts and derive native/external link contracts from it. Pass those contracts from the localized layout/pages into focused presentational components; locale dictionaries hold only professional copy and labels. Preserve the five-page system while adding a desktop Maps action, a mobile Call/Directions bar, an informative footer, and complete Home/Visit content.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, next-intl, Tailwind CSS 4, Vitest/Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-18-navido-goal-2-conversion-design.md`

## Global Constraints

- Preserve the accepted editorial composition, typography, spacing system, color tokens, navigation order, and existing five localized routes.
- `src/lib/business-profile.ts` is the only source for invariant identity, address, time range, phone, email, and external URLs.
- Keep `siteUrl: null`; do not add canonical-origin, sitemap, or structured-data claims.
- Add no reservations, checkout, accounts, analytics, third-party scripts, map iframe, new route, Roastery navigation, or image replacement.
- Vietnamese, English, and Korean copy must be natural and professional; proper nouns, address, phone, email, URLs, platform names, and `07:00–22:00` remain invariant.
- Native `tel:` and `mailto:` links stay in the current context. HTTP(S) destinations use `target="_blank" rel="noreferrer"`.
- Use TDD for every behavior change. Never overwrite accepted screenshots before candidate comparison and explicit inspection.
- Use `C:/Users/tinha/AppData/Local/pnpm/bin/pnpm.CMD` when running commands locally because Corepack is unavailable in this environment; committed command strings remain unchanged.

---

## File Structure

- `src/lib/business-profile.ts`: verified structured facts and external destinations.
- `src/lib/conversion-links.ts`: derived `tel:`, `mailto:`, and external action contract; contains no duplicated literal business values.
- `src/lib/site-config.ts`: navigation/footer copy types only; removes nullable visit-data ownership.
- `src/components/layout/header.tsx`: desktop directions action and mobile navigation inputs.
- `src/components/layout/mobile-navigation.tsx`: existing dialog plus closed-state mobile conversion bar.
- `src/components/layout/footer.tsx`: verified contact and channel presentation.
- `src/app/[locale]/layout.tsx`: injects business/link data into the shared shell and adds mobile-bar clearance.
- `src/sections/home/location-invitation.tsx`: existing Home location composition with verified facts.
- `src/sections/visit/visit-information.tsx`: address, localized daily hours, and phone.
- `src/sections/visit/visit-actions.tsx`: seven verified visit/contact actions.
- `src/sections/visit/visit-map.tsx`: accessible Google Maps link around the visual placeholder.
- `messages/{vi,en,ko}.json`: labels and professional locale copy only.
- `tests/components/*.test.tsx`: link semantics, mobile navigation behavior, footer, and Visit presentation.
- `tests/e2e/{home,visit,navigation}.spec.ts`: three-locale conversion and responsive interaction contracts.
- `tests/e2e/*-visual.spec.ts`: updated rendered contracts and candidate evidence generation.
- `artifacts/visual-qa/**`: accepted Goal 2 captures/measurements only after comparison.

---

### Task 1: Structured Business Facts and Conversion-Link Contract

**Files:**
- Modify: `src/lib/business-profile.ts`
- Create: `src/lib/conversion-links.ts`
- Modify: `src/lib/site-config.ts`
- Modify: `tests/unit/business-profile.test.ts`
- Create: `tests/unit/conversion-links.test.ts`
- Modify: `docs/navido-content-source-of-truth.md`

**Interfaces:**
- Produces: `businessProfile.openingHours.timeRange`, `businessProfile.openingHours.openDaily`, and `conversionLinks` with `call`, `email`, `maps`, `grabFood`, `facebook`, `instagram`, and `zalo`.
- Consumers: Tasks 2–4 use these exact exports; no component constructs a phone/email URL or copies an external destination.

- [ ] **Step 1: Write failing structured-fact and derived-link tests**

Update the business-profile expectation and create `tests/unit/conversion-links.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { businessProfile, externalDestinations } from '@/lib/business-profile';
import { conversionLinks } from '@/lib/conversion-links';

describe('NAVIDO conversion links', () => {
  it('derives native links from verified profile facts', () => {
    expect(conversionLinks.call).toBe(`tel:${businessProfile.phoneE164}`);
    expect(conversionLinks.email).toBe(`mailto:${businessProfile.email}`);
  });

  it('exposes every verified external destination without rewriting it', () => {
    expect(conversionLinks.maps).toBe(externalDestinations.maps);
    expect(conversionLinks.grabFood).toBe(externalDestinations.grabFood);
    expect(conversionLinks.facebook).toBe(externalDestinations.facebook);
    expect(conversionLinks.instagram).toBe(externalDestinations.instagram);
    expect(conversionLinks.zalo).toBe(externalDestinations.zalo);
  });
});
```

The business-profile test must expect:

```ts
openingHours: { openDaily: true, timeRange: '07:00–22:00' }
```

- [ ] **Step 2: Run RED tests**

Run:

```powershell
pnpm.CMD exec vitest run tests/unit/business-profile.test.ts tests/unit/conversion-links.test.ts
```

Expected: FAIL because the opening-hours structure and `conversion-links.ts` do not exist.

- [ ] **Step 3: Implement the structured contract**

Replace the locale-bound hours string with:

```ts
openingHours: Readonly<{
  openDaily: true;
  timeRange: '07:00–22:00';
}>;
```

Create `conversion-links.ts`:

```ts
import { businessProfile, externalDestinations } from './business-profile';

export const conversionLinks = {
  call: `tel:${businessProfile.phoneE164}`,
  email: `mailto:${businessProfile.email}`,
  ...externalDestinations,
} as const;

export type ConversionLinks = typeof conversionLinks;
```

Keep the existing nullable Visit compatibility exports temporarily so Task 1 remains type-safe in isolation; mark their removal as owned by Task 4 after every consumer and test migrates. Update the source-of-truth document to describe `timeRange + openDaily` as the representation of “07:00–22:00 hằng ngày.”

- [ ] **Step 4: Run focused tests and static checks**

Run:

```powershell
pnpm.CMD exec vitest run tests/unit/business-profile.test.ts tests/unit/conversion-links.test.ts
pnpm.CMD typecheck
pnpm.CMD exec prettier --check src/lib/business-profile.ts src/lib/conversion-links.ts src/lib/site-config.ts tests/unit/business-profile.test.ts tests/unit/conversion-links.test.ts docs/navido-content-source-of-truth.md
```

Expected: focused tests, typecheck, and formatting PASS; every task must end at a buildable commit.

- [ ] **Step 5: Commit Task 1**

```bash
git add src/lib/business-profile.ts src/lib/conversion-links.ts src/lib/site-config.ts tests/unit/business-profile.test.ts tests/unit/conversion-links.test.ts docs/navido-content-source-of-truth.md
git commit -m "feat: derive verified NAVIDO conversion links"
```

---

### Task 2: Shared Header, Mobile Conversion Bar, and Footer

**Files:**
- Modify: `src/components/layout/header.tsx`
- Modify: `src/components/layout/mobile-navigation.tsx`
- Modify: `src/components/layout/footer.tsx`
- Modify: `src/app/[locale]/layout.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/lib/site-config.ts`
- Modify: `messages/vi.json`
- Modify: `messages/en.json`
- Modify: `messages/ko.json`
- Modify: `tests/components/mobile-navigation.test.tsx`
- Create: `tests/components/header.test.tsx`
- Create: `tests/components/footer.test.tsx`

**Interfaces:**
- Consumes: `businessProfile`, `conversionLinks`, `NavigationCopy`, and expanded `FooterCopy`.
- Produces: `data-mobile-conversion-bar`, a desktop Maps link, and a complete semantic footer used by every localized route.

- [ ] **Step 1: Write failing shared-shell tests**

Add tests that render the header/footer with real verified contracts. The mobile test must include:

```tsx
render(
  <MobileNavigation
    callHref={conversionLinks.call}
    copy={{ ...defaultNavigationCopy, call: 'Call', directions: 'Directions' }}
    locale="en"
    mapsHref={conversionLinks.maps}
  />,
);

expect(screen.getByTestId('mobile-conversion-bar')).toBeVisible();
expect(screen.getByRole('link', { name: 'Call' })).toHaveAttribute(
  'href',
  conversionLinks.call,
);
await user.click(screen.getByRole('button', { name: 'Open navigation' }));
expect(screen.queryByTestId('mobile-conversion-bar')).not.toBeInTheDocument();
```

Header expectations: the Maps CTA is external and safe. Footer expectations: display name, address, time range, phone, email, and all five external destinations appear with correct native/external link semantics.

- [ ] **Step 2: Run RED component tests**

```powershell
pnpm.CMD exec vitest run tests/components/mobile-navigation.test.tsx tests/components/header.test.tsx tests/components/footer.test.tsx
```

Expected: FAIL because the new props, actions, copy shapes, and footer content are absent.

- [ ] **Step 3: Extend copy contracts and locale dictionaries**

Add `call` and `directions` to `NavigationCopy`. Replace `FooterCopy.informationPending` with localized labels for `address`, `hours`, `phone`, `email`, `maps`, `grabFood`, `facebook`, `instagram`, `zalo`, and `daily`.

Use these professionally translated action labels:

```text
VI: Gọi / Chỉ đường / Mở Google Maps / Đặt qua GrabFood / Mỗi ngày
EN: Call / Directions / Open Google Maps / Order on GrabFood / Daily
KO: 전화 / 길 안내 / Google 지도 열기 / GrabFood에서 주문 / 매일
```

Do not place business values or URLs in the dictionaries.

- [ ] **Step 4: Implement desktop and mobile actions**

Extend `Header` to receive `callHref` and `mapsHref`. Add the desktop Maps action after the language switcher with the existing border/rule vocabulary.

Keep `MobileNavigation` as the sole owner of `isOpen`. When closed, render:

```tsx
<div
  className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t border-[var(--navido-rule)] bg-[var(--navido-paper)] pb-[env(safe-area-inset-bottom)] md:hidden"
  data-testid="mobile-conversion-bar"
>
  <a className="grid min-h-14 place-items-center" href={callHref}>
    {copy.call}
  </a>
  <a
    className="grid min-h-14 place-items-center border-l border-[var(--navido-rule)]"
    href={mapsHref}
    rel="noreferrer"
    target="_blank"
  >
    {copy.directions}
  </a>
</div>
```

Do not render this element when `isOpen` is true. Preserve all existing focus/inert behavior.

- [ ] **Step 5: Implement the complete footer and shell clearance**

Pass `businessProfile` and `conversionLinks` from `[locale]/layout.tsx` into `Header` and `Footer`. Render a compact responsive footer with semantic `<address>`, native phone/email links, and safe external links.

Add a stable class to the body and CSS clearance:

```css
@media (max-width: 767px) {
  .navido-page-shell {
    padding-bottom: calc(3.5rem + env(safe-area-inset-bottom));
  }
}
```

The mobile bar itself supplies safe-area padding; desktop has no extra bottom clearance.

- [ ] **Step 6: Run focused regression and accessibility tests**

```powershell
pnpm.CMD exec vitest run tests/components/mobile-navigation.test.tsx tests/components/header.test.tsx tests/components/footer.test.tsx tests/components/language-switcher.test.tsx
pnpm.CMD typecheck
pnpm.CMD lint
```

Expected: all PASS, including the existing focus-trap, Escape, inert, and focus-restoration tests.

- [ ] **Step 7: Commit Task 2**

```bash
git add src/components/layout/header.tsx src/components/layout/mobile-navigation.tsx src/components/layout/footer.tsx src/app/[locale]/layout.tsx src/app/globals.css src/lib/site-config.ts messages/vi.json messages/en.json messages/ko.json tests/components/mobile-navigation.test.tsx tests/components/header.test.tsx tests/components/footer.test.tsx
git commit -m "feat: add balanced store conversion shell"
```

---

### Task 3: Verified Home Location Invitation

**Files:**
- Modify: `src/sections/home/location-invitation.tsx`
- Modify: `src/app/[locale]/page.tsx`
- Modify: `messages/vi.json`
- Modify: `messages/en.json`
- Modify: `messages/ko.json`
- Create: `tests/components/location-invitation.test.tsx`
- Modify: `tests/e2e/home.spec.ts`

**Interfaces:**
- Consumes: verified address/time range plus localized `daily` and editorial copy.
- Produces: unchanged Home composition with real location/hours and the existing localized `/visit` link.

- [ ] **Step 1: Write failing component and browser assertions**

The component test must pass `address`, `hours`, and `daily` separately and assert all three values plus the localized Visit link render. Extend Home E2E data:

```ts
const localizedDaily = { vi: 'Mỗi ngày', en: 'Daily', ko: '매일' } as const;
```

For every locale, assert the location section contains the exact verified address, `07:00–22:00`, localized daily label, and `/${locale}/visit` href.

- [ ] **Step 2: Run RED tests**

```powershell
pnpm.CMD exec vitest run tests/components/location-invitation.test.tsx
pnpm.CMD exec playwright test tests/e2e/home.spec.ts --workers=1
```

Expected: FAIL because Home still shows pending location copy and the component accepts no facts.

- [ ] **Step 3: Add professional Home copy**

Use dictionary text with no embedded business values:

```text
VI title: Ghé NAVIDO tại Phú Mỹ Hưng
VI body: Một điểm dừng cho cà phê rang tại chỗ, thức uống đặc trưng và những bữa ăn thong thả.
EN title: Visit NAVIDO in Phú Mỹ Hưng
EN body: A place for in-house roasted coffee, signature drinks, and unhurried meals.
KO title: 푸미흥에서 만나는 NAVIDO
KO body: 매장에서 직접 로스팅한 커피와 시그니처 음료, 여유로운 식사를 즐겨 보세요.
```

Keep the existing eyebrow, image alt, and internal action meaning, improving them only to remove pending language.

- [ ] **Step 4: Render verified facts without changing layout**

Add `address`, `hours`, and `daily` props to `LocationInvitation`. Render them as a compact detail block below the body and before the existing `TextLink`. Pass values from `businessProfile` in the Home page. Do not add a section, image, or direct external CTA.

- [ ] **Step 5: Run focused and regression checks**

```powershell
pnpm.CMD exec vitest run tests/components/location-invitation.test.tsx
pnpm.CMD exec playwright test tests/e2e/home.spec.ts --workers=1
pnpm.CMD typecheck
```

Expected: component and three-locale Home tests PASS with four existing Home sections and six existing images.

- [ ] **Step 6: Commit Task 3**

```bash
git add src/sections/home/location-invitation.tsx src/app/[locale]/page.tsx messages/vi.json messages/en.json messages/ko.json tests/components/location-invitation.test.tsx tests/e2e/home.spec.ts
git commit -m "feat: publish verified NAVIDO visit invitation"
```

---

### Task 4: Complete Visit Information, Actions, and Map Link

**Files:**
- Modify: `src/sections/visit/visit-information.tsx`
- Modify: `src/sections/visit/visit-actions.tsx`
- Modify: `src/sections/visit/visit-map.tsx`
- Modify: `src/app/[locale]/visit/page.tsx`
- Modify: `src/lib/site-config.ts`
- Modify: `messages/vi.json`
- Modify: `messages/en.json`
- Modify: `messages/ko.json`
- Modify: `tests/components/visit-actions.test.tsx`
- Create: `tests/components/visit-map.test.tsx`
- Modify: `tests/e2e/visit.spec.ts`

**Interfaces:**
- Consumes: `businessProfile`, `conversionLinks`, and locale-only labels.
- Produces: three non-pending Visit sections with correct native/external link contracts.

- [ ] **Step 1: Replace pending tests with failing verified-data tests**

Rewrite `visit-actions.test.tsx` to assert:

```ts
const expectedActions = [
  ['Directions', conversionLinks.maps, true],
  ['Call', conversionLinks.call, false],
  ['GrabFood', conversionLinks.grabFood, true],
  ['Zalo', conversionLinks.zalo, true],
  ['Instagram', conversionLinks.instagram, true],
  ['Facebook', conversionLinks.facebook, true],
  ['Email', conversionLinks.email, false],
] as const;
```

For external actions, assert `_blank` and `noreferrer`; for Call/Email, assert neither attribute. Assert information address links to Maps, phone displays `phoneDisplay` but links to `call`, and hours show time range plus localized daily.

Create a map test asserting the figure/card links safely to Maps, keeps the placeholder source, and renders a non-pending caption.

- [ ] **Step 2: Run RED component tests**

```powershell
pnpm.CMD exec vitest run tests/components/visit-actions.test.tsx tests/components/visit-map.test.tsx
```

Expected: FAIL because Visit still implements nullable pending configuration and a non-interactive map.

- [ ] **Step 3: Implement focused verified-data components**

Use explicit props rather than a nullable catch-all config:

```ts
type VisitInformationProps = Readonly<{
  address: string;
  callHref: string;
  daily: string;
  hours: string;
  mapsHref: string;
  phoneDisplay: string;
  copy: { address: string; hours: string; phone: string; title: string };
}>;
```

`VisitActions` receives `links: ConversionLinks` and localized labels. Use a discriminated action array with `external: boolean` so native links never receive external attributes.

`VisitMap` receives `href`, `linkLabel`, `caption`, `alt`, and `title`; wrap the figure's interactive content in an anchor and keep the local placeholder image.

After all Visit consumers/tests migrate, remove `VisitBusinessConfig` and `initialVisitBusinessConfig` from `site-config.ts`. Search the repository and require zero remaining references.

- [ ] **Step 4: Replace all Visit pending copy professionally**

Required core copy:

```text
VI introduction: Ghé NAVIDO để thưởng thức cà phê rang tại chỗ, thức uống đặc trưng và thực đơn đa dạng trong không gian Phú Mỹ Hưng.
EN introduction: Visit NAVIDO for coffee roasted in house, signature drinks, and a varied food menu in our Phú Mỹ Hưng space.
KO introduction: 푸미흥의 NAVIDO에서 매장 로스팅 커피와 시그니처 음료, 다양한 푸드 메뉴를 만나보세요.
```

Add natural labels for Call, GrabFood, Zalo, Email, and “Open Google Maps.” Remove address/hours/phone/action/map pending keys after all consumers migrate. Update `Metadata.visit.description` in each locale to describe the verified store and visit utility.

- [ ] **Step 5: Wire the Visit page to canonical data**

Import `businessProfile` and `conversionLinks`; pass exact values into the three sections. Continue passing `businessProfile.siteUrl` to metadata. Keep the introduction/details markup, image paths, grids, and section order unchanged.

- [ ] **Step 6: Rewrite Visit browser coverage**

For each locale at 390×844, assert zero `[data-visit-pending]`, two decoded images, exact address/time/phone, seven action links, correct hrefs, correct external/native attributes, and a linked map card. Also assert no duplicate main action href except Maps intentionally appearing in information/actions/map.

- [ ] **Step 7: Run focused and regression checks**

```powershell
pnpm.CMD exec vitest run tests/components/visit-actions.test.tsx tests/components/visit-map.test.tsx
pnpm.CMD exec playwright test tests/e2e/visit.spec.ts --workers=1
pnpm.CMD typecheck
pnpm.CMD lint
```

Expected: all PASS for VI/EN/KO with no pending markers.

- [ ] **Step 8: Commit Task 4**

```bash
git add src/sections/visit/visit-information.tsx src/sections/visit/visit-actions.tsx src/sections/visit/visit-map.tsx src/app/[locale]/visit/page.tsx src/lib/site-config.ts messages/vi.json messages/en.json messages/ko.json tests/components/visit-actions.test.tsx tests/components/visit-map.test.tsx tests/e2e/visit.spec.ts
git commit -m "feat: publish complete NAVIDO visit details"
```

---

### Task 5: Cross-Locale Conversion and Responsive Browser Contract

**Files:**
- Modify: `tests/unit/i18n.test.ts`
- Modify: `tests/e2e/navigation.spec.ts`
- Create: `tests/e2e/conversion.spec.ts`
- Modify: `tests/e2e/home-visual.spec.ts`
- Modify: `tests/e2e/visit-visual.spec.ts`
- Modify: `tests/e2e/menu-visual.spec.ts`
- Modify: `tests/e2e/our-space-visual.spec.ts`
- Modify: `tests/e2e/about-visual.spec.ts`

**Interfaces:**
- Consumes: completed Goal 2 shell, Home, Visit, and three locale dictionaries.
- Produces: an invariant 15-route conversion matrix and updated visual contracts that understand the shared shell without accepting screenshots yet.

- [ ] **Step 1: Add failing dictionary and conversion-matrix tests**

Extend `i18n.test.ts` to require identical nested key shapes and reject `/being confirmed|đang được xác nhận|확인 중/` within `Home.location`, `Visit`, `Footer`, and `Metadata.visit`.

Create `conversion.spec.ts` covering all 15 localized routes at desktop and mobile:

```ts
const expected = {
  call: 'tel:+84368979361',
  maps: 'https://www.google.com/maps/search/?api=1&query=NAVIDO%20Specialty%20Coffee%20Nam%20Quang%201',
} as const;
```

Desktop asserts the header Maps CTA and absence of the mobile bar. Mobile asserts Call/Maps, minimum 44px targets, no overlap with the footer's final link, disappearance while the dialog is open, and restoration after close.

- [ ] **Step 2: Run RED cross-locale tests**

```powershell
pnpm.CMD exec vitest run tests/unit/i18n.test.ts
pnpm.CMD exec playwright test tests/e2e/conversion.spec.ts --workers=1
```

Expected: FAIL until all dictionary shapes and responsive shell details satisfy the contract.

- [ ] **Step 3: Resolve only contract failures in the owning components/copy**

Fix missing labels, overflow, target sizing, bottom clearance, or dialog/bar state in the files from Tasks 2–4. Do not loosen assertions, introduce new breakpoints, or redesign unrelated sections.

- [ ] **Step 4: Update visual-contract semantics before capture**

Replace Visit's pending-state assertions with:

```ts
pendingCount: 0,
actionAnchorCount: 7,
mapIsLinked: true,
```

Add mobile-bar visibility/clearance metrics to every page visual spec because the bar is part of the shared shell. Add desktop header CTA checks. Preserve existing page geometry, image count/source, section-order, crop, grid, and overflow contracts.

- [ ] **Step 5: Run non-capture contract tests**

```powershell
pnpm.CMD exec vitest run tests/unit/i18n.test.ts
pnpm.CMD exec playwright test tests/e2e/home.spec.ts tests/e2e/visit.spec.ts tests/e2e/navigation.spec.ts tests/e2e/conversion.spec.ts --workers=1
pnpm.CMD typecheck
pnpm.CMD lint
```

Expected: all PASS at three locales with no console errors, failed requests, overflow, or obscured footer content.

- [ ] **Step 6: Commit Task 5**

```bash
git add tests/unit/i18n.test.ts tests/e2e/navigation.spec.ts tests/e2e/conversion.spec.ts tests/e2e/home-visual.spec.ts tests/e2e/visit-visual.spec.ts tests/e2e/menu-visual.spec.ts tests/e2e/our-space-visual.spec.ts tests/e2e/about-visual.spec.ts
git commit -m "test: enforce NAVIDO conversion experience"
```

If Step 3 required a narrow production or dictionary fix, add only that exact reviewed file to this commit. Inspect `git diff --cached --name-only` and exclude every unrelated path.

---

### Task 6: Visual Acceptance and Goal 2 Verification

**Files:**
- Modify: `artifacts/visual-qa/home/*.png`
- Modify: `artifacts/visual-qa/menu/*.png`
- Modify: `artifacts/visual-qa/our-space/*.png`
- Modify: `artifacts/visual-qa/about/*.png`
- Modify: `artifacts/visual-qa/visit/*.png`
- Modify: `artifacts/visual-qa/{home,menu,our-space,about,visit}/metrics.json`
- Modify: `artifacts/visual-qa/{home,menu,our-space,about,visit}/comparison.md`
- Modify: `artifacts/visual-qa/shared/*.png`
- Modify: `artifacts/visual-qa/shared/discrepancy-log.md`
- Modify: `artifacts/visual-qa/index.md`
- Test: all deterministic, unit/component, E2E, visual, build, and route checks.

**Interfaces:**
- Consumes: completed Goal 2 implementation and Goal 1 accepted captures.
- Produces: reviewed Goal 2 visual evidence and a clean, verified milestone.

- [ ] **Step 1: Generate candidates without touching accepted evidence**

Create an ignored scratch directory under `.superpowers/sdd/2026-09-18-navido-goal-2-conversion/visual-candidates`. Run the committed visual specs from that working directory with a temporary config that imports the committed Playwright configuration, retains Chromium/web-server/assertion behavior, uses absolute test paths, and redirects only process-CWD-derived artifacts.

Before running, record SHA-256 for all accepted visual files. After running, prove every accepted hash is unchanged and that candidates exist for all 45 page captures plus the three shared-shell states.

- [ ] **Step 2: Inspect candidate deltas at every required viewport**

Compare Goal 1 and Goal 2 candidates for each page family and locale. Explicitly inspect:

- desktop header CTA alignment and navigation fit;
- mobile bar height, safe-area treatment, equal targets, and content clearance;
- closed/open mobile navigation states;
- footer reading order and wrapping;
- Home location details;
- Visit information/actions/map-card hierarchy;
- VI/EN/KO wrapping at 390×844, 768×1024, and 1440×900.

Reject candidates with overlap, clipped text, unintended grid/crop changes, missing focus treatment, or a design-system departure. Fix code and regenerate candidates until clean.

- [ ] **Step 3: Accept the reviewed captures**

Run each committed visual verifier from the repository root only after Step 2 approval:

```powershell
pnpm.CMD verify:home-visual
pnpm.CMD verify:menu-visual
pnpm.CMD verify:our-space-visual
pnpm.CMD verify:about-visual
pnpm.CMD verify:visit-visual
```

Refresh the three shared-shell captures with the same viewports and states as Goal 1. Update comparison/discrepancy text to describe the intentional Goal 2 shell/content changes and retain all unchanged page-specific contracts.

- [ ] **Step 4: Run the complete verification matrix**

```powershell
pnpm.CMD validate:baseline-content
pnpm.CMD format:check
pnpm.CMD lint
pnpm.CMD typecheck
pnpm.CMD test
pnpm.CMD build
pnpm.CMD test:e2e
```

Expected:

- deterministic checks PASS;
- formatting, lint, and typecheck PASS;
- all unit/component and browser tests PASS with no retry or skip;
- production build emits exactly 15 localized customer routes plus framework outputs;
- no `/roastery` route exists;
- no accepted screenshot changes beyond reviewed Goal 2 outputs.

Use the same temporary PATH/Corepack forwarding technique documented in Goal 1 without changing committed scripts.

- [ ] **Step 5: Audit scope and destination integrity**

Run:

```bash
git diff --check 22d8a14..HEAD
git diff --name-status 22d8a14..HEAD
git diff 22d8a14..HEAD -- public/images menu.json src/features/menu/data/normalized-menu.generated.json
git status --short
```

Expected: no public image/menu changes, no whitespace errors, no unrelated routes/components, and no uncommitted tracked changes before the evidence update.

Programmatically assert all rendered `tel:`, `mailto:`, Maps, GrabFood, Facebook, Instagram, and Zalo hrefs equal the canonical contracts and contain no tracking parameters.

- [ ] **Step 6: Record and commit Goal 2 evidence**

Append a dated Goal 2 section to `artifacts/visual-qa/index.md` with exact command results, pass counts, route count, candidate-review outcome, and any non-failing warnings. Commit reviewed visual artifacts and evidence:

```bash
git add artifacts/visual-qa
git commit -m "test: accept NAVIDO conversion visuals"
```

- [ ] **Step 7: Final post-commit check**

```powershell
pnpm.CMD validate:baseline-content
pnpm.CMD format:check
pnpm.CMD lint
pnpm.CMD typecheck
git status --short
```

Expected: every command PASS and tracked worktree clean.

---

## Plan Completion Criteria

Goal 2 is complete only when Tasks 1–6 are individually reviewed, the final three-locale conversion matrix passes, all 15 routes retain the accepted design language, the mobile bar and menu state coexist accessibly, all destinations match the verified source of truth, candidate screenshots are inspected before acceptance, full build/E2E verification passes, and the tracked worktree is clean.
