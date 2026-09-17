# NAVIDO Goal 1 Baseline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish a tested source of truth for NAVIDO business facts, authentic asset intake, provisional menu publication, and the accepted 15-route visual baseline without changing customer-visible page composition.

**Architecture:** Add small typed domain modules for verified business facts, asset manifests, and menu-publication policy; keep the current page components and `initialVisitBusinessConfig` wiring unchanged. Deterministic scripts generate the committed asset and visual-baseline artifacts, while focused Vitest coverage verifies every source record and route contract.

**Tech Stack:** Next.js 16 App Router, React 19, strict TypeScript 6, Zod 4, `sharp` 0.35.4 for image metadata, Vitest 4, Playwright 1.62, pnpm 10.

**Spec:** `docs/superpowers/specs/2026-09-17-navido-goal-1-baseline-design.md`

## Global Constraints

- Preserve the existing Quietude Editorial layout, shared shell, typography, spacing, and accepted visual-QA captures.
- Do not add the Roastery route, wire verified facts into customer pages, or replace page images in Goal 1.
- Keep `menu.json` byte-for-byte unchanged.
- Treat the Vercel preview as non-production; `siteUrl` remains `null`.
- Never expose the unverified roaster manufacturer, model, or estimated 5–15 kg capacity in public data.
- Do not use unlicensed third-party imagery.
- Keep Vietnamese, English, and Korean as the supported locale set.
- Use test-first steps and commit each task independently.

## File Structure

- `src/lib/business-profile.ts`: typed verified business facts that Goal 2 will consume.
- `src/lib/asset-manifest.ts`: Zod schema and types for authentic asset inventory records.
- `scripts/generate-asset-manifest.ts`: scans the external intake directory and deterministically writes/checks the committed manifest.
- `docs/asset-inventory.json`: machine-readable inventory of all 110 supplied files.
- `docs/asset-inventory.md`: human-readable grouping, coverage, and missing-media summary.
- `src/features/menu/domain/publication.ts`: deterministic `draft`/`hidden` classification; no UI wiring.
- `src/lib/site-baseline.ts`: existing route/page landmark contract.
- `scripts/generate-visual-baseline.ts`: writes/checks the committed baseline artifact.
- `artifacts/visual-qa/baseline.json`: machine-readable route, screenshot, landmark, and verification record.
- `docs/navido-content-source-of-truth.md`: owner-approved facts, claims, destinations, and prohibited claims.
- `docs/missing-content.md`: unresolved domain and Roastery-media register.
- `tests/unit/business-profile.test.ts`: verified-fact and no-production-origin coverage.
- `tests/unit/asset-manifest.test.ts`: manifest cardinality, paths, schema, and coverage checks.
- `tests/unit/menu-publication.test.ts`: deterministic mock-product exclusion policy.
- `tests/unit/site-baseline.test.ts`: 15-route and accepted-screenshot coverage.

---

### Task 1: Typed Business Source of Truth

**Files:**
- Create: `src/lib/business-profile.ts`
- Create: `tests/unit/business-profile.test.ts`
- Create: `docs/navido-content-source-of-truth.md`

**Interfaces:**
- Consumes: owner-verified facts recorded in the approved spec.
- Produces: `BusinessProfile`, `businessProfile`, and `externalDestinations`; later milestones import these instead of repeating literals.

- [ ] **Step 1: Write the failing business-profile test**

Create `tests/unit/business-profile.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import {
  businessProfile,
  externalDestinations,
} from '@/lib/business-profile';

describe('verified NAVIDO business profile', () => {
  it('stores the owner-approved identity and visit facts', () => {
    expect(businessProfile).toEqual({
      displayName: 'NAVIDO Specialty Coffee',
      address:
        '23 Khu Phố Nam Quang 1, Phú Mỹ Hưng, phường Tân Hưng, TP. Hồ Chí Minh',
      openingHours: '07:00–22:00 hằng ngày',
      phoneDisplay: '0368 979 361',
      phoneE164: '+84368979361',
      email: 'navidocf@gmail.com',
      siteUrl: null,
    });
  });

  it('stores only verified external destinations', () => {
    expect(externalDestinations).toEqual({
      maps:
        'https://www.google.com/maps/search/?api=1&query=NAVIDO%20Specialty%20Coffee%20Nam%20Quang%201',
      grabFood:
        'https://food.grab.com/vn/vi/restaurant/navido-coffee-roaster-delivery/5-C7WALGCHALJKRA',
      facebook:
        'https://www.facebook.com/navidocoffeetea?locale=vi_VN',
      instagram: 'https://www.instagram.com/navidocoffee/?hl=en',
      zalo: 'https://zalo.me/84368979361',
    });
  });

  it('does not invent a production domain or roaster specification', () => {
    expect(businessProfile.siteUrl).toBeNull();
    expect(JSON.stringify({ businessProfile, externalDestinations })).not.toMatch(
      /vercel\.app|roasterModel|batchCapacity|5–15/i,
    );
  });
});
```

- [ ] **Step 2: Run the test and confirm the missing-module failure**

Run:

```bash
corepack pnpm test -- tests/unit/business-profile.test.ts
```

Expected: FAIL because `@/lib/business-profile` does not exist.

- [ ] **Step 3: Implement the typed business profile**

Create `src/lib/business-profile.ts`:

```ts
export type BusinessProfile = Readonly<{
  displayName: string;
  address: string;
  openingHours: string;
  phoneDisplay: string;
  phoneE164: `+${number}`;
  email: `${string}@${string}`;
  siteUrl: string | null;
}>;

export type ExternalDestinations = Readonly<{
  maps: string;
  grabFood: string;
  facebook: string;
  instagram: string;
  zalo: string;
}>;

export const businessProfile: BusinessProfile = {
  displayName: 'NAVIDO Specialty Coffee',
  address:
    '23 Khu Phố Nam Quang 1, Phú Mỹ Hưng, phường Tân Hưng, TP. Hồ Chí Minh',
  openingHours: '07:00–22:00 hằng ngày',
  phoneDisplay: '0368 979 361',
  phoneE164: '+84368979361',
  email: 'navidocf@gmail.com',
  siteUrl: null,
};

export const externalDestinations: ExternalDestinations = {
  maps:
    'https://www.google.com/maps/search/?api=1&query=NAVIDO%20Specialty%20Coffee%20Nam%20Quang%201',
  grabFood:
    'https://food.grab.com/vn/vi/restaurant/navido-coffee-roaster-delivery/5-C7WALGCHALJKRA',
  facebook: 'https://www.facebook.com/navidocoffeetea?locale=vi_VN',
  instagram: 'https://www.instagram.com/navidocoffee/?hl=en',
  zalo: 'https://zalo.me/84368979361',
};
```

Do not import this module into `site-config.ts` yet; Goal 2 owns customer-visible wiring.

- [ ] **Step 4: Write the content source-of-truth document**

Create `docs/navido-content-source-of-truth.md` with these exact sections and facts:

```markdown
# NAVIDO Content Source of Truth

## Verified identity and visit facts

- Display name: NAVIDO Specialty Coffee
- Address: 23 Khu Phố Nam Quang 1, Phú Mỹ Hưng, phường Tân Hưng, TP. Hồ Chí Minh
- Opening hours: 07:00–22:00 every day
- Phone and Zalo: 0368 979 361 (`+84368979361`)
- Email: navidocf@gmail.com
- Production domain: not yet verified

## Approved brand claims

- Coffee is roasted in-house at the store using a commercial high-capacity roaster.
- NAVIDO works with multiple origins and has a dedicated roaster.
- Packaged roasted beans are available to take home.
- NAVIDO offers signature drinks, specialty coffee, a diverse food menu, an inviting space, and attentive service.

## Prohibited public claims

- Do not publish a roaster manufacturer, model, or batch capacity until verified.
- Do not present the 5–15 kg internal planning estimate as fact.
- Do not present the Vercel preview or the door graphic `www.navido.com` as an owned production domain.

## Verified destinations

- Google Maps: https://www.google.com/maps/search/?api=1&query=NAVIDO%20Specialty%20Coffee%20Nam%20Quang%201
- GrabFood: https://food.grab.com/vn/vi/restaurant/navido-coffee-roaster-delivery/5-C7WALGCHALJKRA
- Facebook: https://www.facebook.com/navidocoffeetea?locale=vi_VN
- Instagram: https://www.instagram.com/navidocoffee/?hl=en
- Zalo: https://zalo.me/84368979361

## Menu publication rule

`menu.json` is provisional and approximately 80% accurate. Preserve it unchanged, hide mock products, and state that availability and prices may change until an official menu replaces it.
```

- [ ] **Step 5: Run focused verification**

Run:

```bash
corepack pnpm test -- tests/unit/business-profile.test.ts
corepack pnpm typecheck
```

Expected: both PASS; no customer page imports `business-profile.ts` yet.

- [ ] **Step 6: Commit Task 1**

```bash
git add src/lib/business-profile.ts tests/unit/business-profile.test.ts docs/navido-content-source-of-truth.md
git commit -m "feat: record verified NAVIDO business facts"
```

---

### Task 2: Deterministic Authentic-Asset Manifest

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Create: `src/lib/asset-manifest.ts`
- Create: `scripts/generate-asset-manifest.ts`
- Create: `tests/unit/asset-manifest.test.ts`
- Create: `docs/asset-inventory.json`
- Create: `docs/asset-inventory.md`

**Interfaces:**
- Consumes: files under `D:/Projects/navido/incoming-assets/navido` and `sharp@0.35.4` metadata.
- Produces: `AssetManifestEntry`, `AssetManifestSchema`, the `generate:assets`/`validate:assets` commands, and deterministic JSON/Markdown inventory artifacts.

- [ ] **Step 1: Add `sharp` as a direct development dependency**

Run:

```bash
corepack pnpm add -D sharp@0.35.4
```

Expected: `package.json` lists `sharp` in `devDependencies`; the existing lockfile package is promoted to a direct importer dependency without changing Next.js versions.

- [ ] **Step 2: Write the failing asset-manifest unit test**

Create `tests/unit/asset-manifest.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { AssetManifestSchema } from '@/lib/asset-manifest';

const manifest = AssetManifestSchema.parse(
  JSON.parse(readFileSync(resolve('docs/asset-inventory.json'), 'utf8')),
);

describe('authentic NAVIDO asset manifest', () => {
  it('records every supplied asset exactly once', () => {
    expect(manifest.assets).toHaveLength(110);
    expect(new Set(manifest.assets.map((asset) => asset.intakePath)).size).toBe(
      110,
    );
    expect(manifest.assets.every((asset) => asset.width > 0)).toBe(true);
    expect(manifest.assets.every((asset) => asset.height > 0)).toBe(true);
  });

  it('records known file-format counts', () => {
    const counts = manifest.assets.reduce<Record<string, number>>(
      (result, asset) => ({
        ...result,
        [asset.format]: (result[asset.format] ?? 0) + 1,
      }),
      {},
    );
    expect(counts).toEqual({ avif: 97, jpeg: 3, jpg: 6, png: 2, webp: 2 });
  });

  it('keeps unresolved Roastery photography explicit', () => {
    expect(manifest.missingGroups).toEqual([
      'packaging',
      'roaster-machine',
      'roasting-process',
      'roasting-team',
    ]);
  });
});
```

- [ ] **Step 3: Run the test and confirm the missing-schema/artifact failure**

Run:

```bash
corepack pnpm test -- tests/unit/asset-manifest.test.ts
```

Expected: FAIL because `src/lib/asset-manifest.ts` and `docs/asset-inventory.json` do not exist.

- [ ] **Step 4: Implement the manifest schema**

Create `src/lib/asset-manifest.ts`:

```ts
import { z } from 'zod';

export const AssetGroupSchema = z.enum([
  'bakery',
  'coffee',
  'logo',
  'menu',
  'space',
]);

export const AssetManifestEntrySchema = z.object({
  id: z.string().min(1),
  intakePath: z.string().min(1),
  proposedPublicPath: z.string().startsWith('/images/navido/'),
  group: AssetGroupSchema,
  format: z.enum(['avif', 'jpeg', 'jpg', 'png', 'webp']),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  intendedUse: z.string().min(1),
  altSubject: z.string().min(1),
  crop: z.enum(['landscape', 'portrait', 'square', 'flexible']),
  authenticity: z.literal('verified-navido'),
  replacementStatus: z.enum(['ready', 'review-crop']),
  provenance: z.literal('owner-supplied'),
});

export const AssetManifestSchema = z.object({
  generatedFrom: z.literal('incoming-assets/navido'),
  assets: z.array(AssetManifestEntrySchema),
  missingGroups: z.array(
    z.enum([
      'packaging',
      'roaster-machine',
      'roasting-process',
      'roasting-team',
    ]),
  ),
});

export type AssetManifestEntry = z.infer<typeof AssetManifestEntrySchema>;
```

- [ ] **Step 5: Implement deterministic manifest generation**

Create `scripts/generate-asset-manifest.ts`. It must:

1. Resolve the default intake directory to `../../../incoming-assets/navido` from the script URL.
2. Accept `--source <absolute-path>` for another checkout and `--check` for validation-only mode.
3. Recursively sort file paths using `localeCompare('en')`.
4. Read width, height, and format with `sharp(path).metadata()`.
5. Derive `group` from the first relative directory segment.
6. Derive `id` from the extensionless lowercase filename.
7. Write `docs/asset-inventory.json` through `AssetManifestSchema.parse(...)`.
8. Write `docs/asset-inventory.md` with counts by group/format and the four missing Roastery groups.
9. In `--check` mode, fail when source files, generated JSON, or generated Markdown differ.

Use these pure helpers so the test surface stays stable:

```ts
export function cropFor(width: number, height: number) {
  const ratio = width / height;
  if (ratio > 1.2) return 'landscape' as const;
  if (ratio < 0.8) return 'portrait' as const;
  if (ratio >= 0.95 && ratio <= 1.05) return 'square' as const;
  return 'flexible' as const;
}

export function proposedPublicPath(relativePath: string): string {
  return `/images/navido/${relativePath.replaceAll('\\\\', '/')}`;
}
```

Map `intendedUse` and `altSubject` from filename prefixes (`navido_space_`, `navido_menu_`, `navido_logo_`, `navido_coffee_`, `navido_bakery_`). Unknown prefixes must throw with the offending path instead of producing generic content.

- [ ] **Step 6: Add generation commands and generate artifacts**

Add these scripts to `package.json`:

```json
"generate:assets": "tsx scripts/generate-asset-manifest.ts",
"validate:assets": "tsx scripts/generate-asset-manifest.ts --check"
```

Run:

```bash
corepack pnpm generate:assets
corepack pnpm validate:assets
```

Expected: JSON and Markdown are written, then validation exits 0 with 110 unique files.

- [ ] **Step 7: Run focused tests and typecheck**

Run:

```bash
corepack pnpm test -- tests/unit/asset-manifest.test.ts
corepack pnpm typecheck
```

Expected: PASS.

- [ ] **Step 8: Commit Task 2**

```bash
git add package.json pnpm-lock.yaml src/lib/asset-manifest.ts scripts/generate-asset-manifest.ts tests/unit/asset-manifest.test.ts docs/asset-inventory.json docs/asset-inventory.md
git commit -m "feat: inventory authentic NAVIDO assets"
```

---

### Task 3: Provisional Menu Publication Policy

**Files:**
- Create: `src/features/menu/domain/publication.ts`
- Create: `tests/unit/menu-publication.test.ts`

**Interfaces:**
- Consumes: existing `MenuItem` objects from normalization.
- Produces: `MenuPublicationStatus` and `getMenuPublicationStatus(item)` for Goal 4; Goal 1 does not change repository output or rendered menu items.

- [ ] **Step 1: Write the failing publication-policy test**

Create `tests/unit/menu-publication.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import rawMenu from '../../menu.json';

import { normalizeMenu } from '@/features/menu/domain/normalize';
import { getMenuPublicationStatus } from '@/features/menu/domain/publication';

describe('provisional menu publication policy', () => {
  const result = normalizeMenu(rawMenu);

  it('hides every mock-source product deterministically', () => {
    const mockItems = result.items.filter(
      (item) =>
        item.sourceCategoryCode.trim() === 'MOCK_BEANS' ||
        /\bmock\b/i.test(item.sourceName),
    );

    expect(mockItems).toHaveLength(3);
    expect(mockItems.map(getMenuPublicationStatus)).toEqual([
      'hidden',
      'hidden',
      'hidden',
    ]);
  });

  it('classifies all non-mock source items as provisional drafts', () => {
    const statuses = result.items
      .filter((item) => item.sourceCategoryCode.trim() !== 'MOCK_BEANS')
      .map(getMenuPublicationStatus);

    expect(new Set(statuses)).toEqual(new Set(['draft']));
  });
});
```

- [ ] **Step 2: Run the test and confirm the missing-module failure**

Run:

```bash
corepack pnpm test -- tests/unit/menu-publication.test.ts
```

Expected: FAIL because `publication.ts` does not exist.

- [ ] **Step 3: Implement the publication classifier**

Create `src/features/menu/domain/publication.ts`:

```ts
import type { MenuItem } from './types';

export type MenuPublicationStatus = 'draft' | 'verified' | 'hidden';

export function getMenuPublicationStatus(
  item: MenuItem,
): MenuPublicationStatus {
  const isMock =
    item.sourceCategoryCode.trim() === 'MOCK_BEANS' ||
    /\bmock\b/i.test(item.sourceName);

  return isMock ? 'hidden' : 'draft';
}
```

Do not filter `localMenuRepository` in Goal 1. Goal 4 will promote approved records and wire publication status into rendering.

- [ ] **Step 4: Run focused and regression tests**

Run:

```bash
corepack pnpm test -- tests/unit/menu-publication.test.ts tests/unit/menu-normalize.test.ts tests/unit/menu-repository.test.ts
corepack pnpm validate:menu
```

Expected: PASS; `menu.json` and generated menu artifacts remain unchanged.

- [ ] **Step 5: Prove the raw menu source is unchanged**

Run:

```bash
git diff --exit-code -- menu.json src/features/menu/data/normalized-menu.generated.json docs/menu-review.md
```

Expected: exit 0 with no diff.

- [ ] **Step 6: Commit Task 3**

```bash
git add src/features/menu/domain/publication.ts tests/unit/menu-publication.test.ts
git commit -m "feat: define provisional menu publication policy"
```

---

### Task 4: Machine-Readable Visual Baseline

**Files:**
- Create: `src/lib/site-baseline.ts`
- Create: `scripts/generate-visual-baseline.ts`
- Create: `tests/unit/site-baseline.test.ts`
- Create: `artifacts/visual-qa/baseline.json`
- Modify: `package.json`

**Interfaces:**
- Consumes: `locales` from `src/i18n/types.ts`, `pagePaths` from `src/lib/metadata.ts`, and accepted PNGs under `artifacts/visual-qa`.
- Produces: `siteBaseline`, `BaselinePage`, `generate:baseline`, `validate:baseline`, and the deterministic baseline JSON used by later visual-regression milestones.

- [ ] **Step 1: Write the failing baseline test**

Create `tests/unit/site-baseline.test.ts`:

```ts
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { siteBaseline } from '@/lib/site-baseline';

describe('accepted site baseline', () => {
  it('covers five pages in all three locales', () => {
    expect(siteBaseline.routes).toHaveLength(15);
    expect(new Set(siteBaseline.routes)).toEqual(
      new Set([
        '/vi', '/en', '/ko',
        '/vi/menu', '/en/menu', '/ko/menu',
        '/vi/our-space', '/en/our-space', '/ko/our-space',
        '/vi/about', '/en/about', '/ko/about',
        '/vi/visit', '/en/visit', '/ko/visit',
      ]),
    );
  });

  it('references existing accepted captures for every page and viewport', () => {
    for (const page of siteBaseline.pages) {
      expect(page.screenshots).toHaveLength(9);
      for (const screenshot of page.screenshots) {
        expect(existsSync(resolve(screenshot))).toBe(true);
      }
    }
  });

  it('matches the committed generated artifact', () => {
    const artifact = JSON.parse(
      readFileSync(resolve('artifacts/visual-qa/baseline.json'), 'utf8'),
    );
    expect(artifact).toEqual(siteBaseline);
  });
});
```

- [ ] **Step 2: Run the test and confirm the missing-module/artifact failure**

Run:

```bash
corepack pnpm test -- tests/unit/site-baseline.test.ts
```

Expected: FAIL because `site-baseline.ts` and `baseline.json` do not exist.

- [ ] **Step 3: Implement the baseline contract**

Create `src/lib/site-baseline.ts` with this exported shape:

```ts
export type BaselinePage = Readonly<{
  id: 'home' | 'menu' | 'our-space' | 'about' | 'visit';
  path: '/' | '/menu' | '/our-space' | '/about' | '/visit';
  landmarks: readonly string[];
  expectedDecodedImages: number;
  screenshots: readonly string[];
}>;

export type SiteBaseline = Readonly<{
  locales: readonly ['vi', 'en', 'ko'];
  routes: readonly string[];
  viewports: readonly ['desktop-1440x900', 'tablet-768x1024', 'mobile-390x844'];
  pages: readonly BaselinePage[];
  verificationCommands: readonly string[];
}>;
```

Populate page landmarks from existing `data-*` contracts:

- Home: `hero`, `introduction`, `signature-highlights`, `location-invitation`; decoded images `6`.
- Menu: `introduction`, `picks`, `category-navigation`, `category-list`; decoded images `9` on accepted desktop contract.
- Our Space: `hero`, `morning-light`, `quiet-table`, `downstairs`, `upstairs`, `callout`; decoded images `5`.
- About: `introduction`, `coffee`, `food`, `space`, `community`; decoded images `5`.
- Visit: `introduction`, `information`, `actions`, `map`; decoded images `2`.

Generate each screenshot path as:

```ts
`artifacts/visual-qa/${pageDirectory}/${locale}-${viewport}.png`
```

Use the exact verification commands:

```ts
[
  'corepack pnpm lint',
  'corepack pnpm typecheck',
  'corepack pnpm test',
  'corepack pnpm test:e2e',
  'corepack pnpm build',
]
```

- [ ] **Step 4: Implement baseline generation/check mode**

Create `scripts/generate-visual-baseline.ts`:

```ts
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { siteBaseline } from '../src/lib/site-baseline';

const outputPath = resolve('artifacts/visual-qa/baseline.json');
const output = `${JSON.stringify(siteBaseline, null, 2)}\n`;
const checkOnly = process.argv.slice(2).includes('--check');

if (checkOnly) {
  const current = await readFile(outputPath, 'utf8');
  if (current !== output) {
    throw new Error('Visual baseline is out of date. Run pnpm generate:baseline.');
  }
} else {
  await writeFile(outputPath, output, 'utf8');
}
```

Reject any argument other than `--check`, matching the menu generator's command discipline.

- [ ] **Step 5: Add scripts and generate the baseline artifact**

Add to `package.json`:

```json
"generate:baseline": "tsx scripts/generate-visual-baseline.ts",
"validate:baseline": "tsx scripts/generate-visual-baseline.ts --check"
```

Run:

```bash
corepack pnpm generate:baseline
corepack pnpm validate:baseline
corepack pnpm test -- tests/unit/site-baseline.test.ts
```

Expected: PASS with 15 routes, 45 accepted screenshots, and no missing file reference.

- [ ] **Step 6: Commit Task 4**

```bash
git add src/lib/site-baseline.ts scripts/generate-visual-baseline.ts tests/unit/site-baseline.test.ts artifacts/visual-qa/baseline.json package.json
git commit -m "test: codify NAVIDO visual baseline"
```

---

### Task 5: Resolve the Content Register and Verify Goal 1

**Files:**
- Modify: `docs/missing-content.md`
- Modify: `README.md`
- Modify: `package.json`
- Test: all existing and new unit, component, E2E, build, and deterministic-generation checks.

**Interfaces:**
- Consumes: Tasks 1–4 artifacts and the approved Goal 1 spec.
- Produces: accurate handoff documentation and a single `validate:baseline-content` command for Goal 1 regression checks.

- [ ] **Step 1: Rewrite the missing-content register against current evidence**

Update `docs/missing-content.md` to contain exactly three status groups:

1. **Resolved business facts:** display name, address, hours, phone/Zalo, Maps, GrabFood, Facebook, Instagram, email; link to `docs/navido-content-source-of-truth.md`.
2. **Provisional inputs:** `menu.json` at approximately 80% accuracy and non-mock records as draft; link to `docs/menu-review.md`.
3. **Remaining launch gaps:** production domain and authentic photography for roaster machine, roasting process, roasting team, and packaged beans.

Keep the Stitch placeholder section, but state that Tasks 3–6 replace assets page by page rather than implying no authentic photography exists.

- [ ] **Step 2: Add the aggregate validation script**

Add to `package.json`:

```json
"validate:baseline-content": "pnpm validate:menu && pnpm validate:assets && pnpm validate:baseline"
```

Use `pnpm` inside the script, consistent with the existing `build` script.

- [ ] **Step 3: Document Goal 1 commands and source locations**

Add a `Baseline content` section to `README.md` containing:

```markdown
## Baseline content

- Verified business facts: `src/lib/business-profile.ts` and `docs/navido-content-source-of-truth.md`
- Authentic asset intake: `../../incoming-assets/navido`
- Generated asset inventory: `docs/asset-inventory.json` and `docs/asset-inventory.md`
- Provisional menu source: immutable `menu.json`; mock records classify as hidden
- Accepted visual baseline: `artifacts/visual-qa/baseline.json`

Run `corepack pnpm validate:baseline-content` after changing any baseline input.
The external intake directory is required only for asset generation and validation; production builds continue to use committed public assets until later milestones replace them.
```

- [ ] **Step 4: Run format and deterministic checks**

Run:

```bash
corepack pnpm exec prettier --write src/lib/business-profile.ts src/lib/asset-manifest.ts src/features/menu/domain/publication.ts src/lib/site-baseline.ts scripts/generate-asset-manifest.ts scripts/generate-visual-baseline.ts tests/unit/business-profile.test.ts tests/unit/asset-manifest.test.ts tests/unit/menu-publication.test.ts tests/unit/site-baseline.test.ts docs/navido-content-source-of-truth.md docs/asset-inventory.md docs/missing-content.md README.md package.json
corepack pnpm validate:baseline-content
corepack pnpm format:check
```

Expected: all commands PASS; the second validation run produces no diff.

- [ ] **Step 5: Run full static verification**

Run:

```bash
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build
```

Expected: all commands PASS. The production build still contains only the original 15 localized customer routes.

- [ ] **Step 6: Run browser and visual-contract verification**

Run:

```bash
corepack pnpm test:e2e
```

Expected: all existing E2E and visual-contract tests PASS without recapturing screenshots because Goal 1 makes no customer-visible presentation change.

- [ ] **Step 7: Audit the final diff against Goal 1 scope**

Run:

```bash
git diff --check
git status --short
git diff --stat HEAD
git diff HEAD -- src/app src/components src/sections messages public/images
```

Expected:

- no whitespace errors;
- only the files named by this plan are changed;
- the final command prints no diff, proving no page, shared component, locale dictionary, or public image changed;
- `menu.json` remains unchanged;
- no `/roastery` route exists yet.

- [ ] **Step 8: Commit Task 5**

```bash
git add README.md package.json docs/missing-content.md
git commit -m "docs: complete NAVIDO baseline handoff"
```

- [ ] **Step 9: Record Goal 1 verification evidence**

Append a dated Goal 1 entry to `artifacts/visual-qa/index.md` listing the exact commands and pass counts from Steps 4–6. Commit the evidence:

```bash
git add artifacts/visual-qa/index.md
git commit -m "docs: record Goal 1 verification evidence"
```

Expected: clean worktree and seven Goal 1 commits including the approved spec commit `121bdc6` and the final verification-evidence commit.
