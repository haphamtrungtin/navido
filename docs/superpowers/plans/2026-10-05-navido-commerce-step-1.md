# NAVIDO Commerce Step 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Preserve the existing worktree and inline execution selected for this commerce implementation.

**Goal:** Extend catalog management and render public categories/items from DB.

**Architecture:** Add a restricted public projection RPC and an asynchronous server repository. Extend existing item version/audit with transactional option/content mutations, a singleton order schedule, and owner-only normalized Storage uploads.

**Tech Stack:** Existing Next.js 16, React 19, TypeScript, Zod, Supabase PostgreSQL/Auth/Storage; Sharp for decoding/normalizing images.

**Spec:** `docs/superpowers/specs/2026-10-05-navido-commerce-step-1-design.md`, approved 2026-10-05.

## Global Constraints

- VI admin; public VI/EN/KO with VI fallback. VND integer, timezone Asia/Ho_Chi_Minh.
- Additive migrations only; preserve catalog edits/import metadata. No production promotion.
- No E2E/Playwright or verify:* commands. Unit/component, integration, pgTAP and manual HTTP.
- Public DB reads use publishable credentials and no admin cookies; no-store; build without DB credentials.
- Active owner edits content/options/images/schedule; staff only availability and order pause. Version/audit enforced in DB.
- Upload JPEG/PNG/WebP <=3 MiB, <=16 megapixel, output WebP <=1600px. No arbitrary URL/path.

## Review Focus

- Public category/item projection must omit draft/mock/source/audit, including published mock records.
- New items without import source IDs and unknown categories must render and remain distinct in selectors.
- Option mutations must reject impossible required groups and stale versions atomically.
- Upload must reject fake MIME, excessive pixels and revoked/staff access, preserving old image on conflict.
- Schedule must reject prep time beyond service close, and staff must not change schedule through direct API.

### Task 1: Public DB menu and consumers

**Files:** create `supabase/migrations/20261005000400_public_menu.sql`, `src/features/menu/domain/published-menu.ts`, `src/features/menu/repository/published-menu-repository.ts`, `src/lib/supabase/public.ts`, `src/features/menu/components/menu-read-status.tsx`; modify public Menu/Home/Roastery pages, selectors/types; test `tests/unit/published-menu.test.ts`, `tests/unit/roastery-selectors.test.ts`, `supabase/tests/database/public-menu.test.sql`.

**Interfaces:** produces `PublishedMenu = { categories: MenuCategory[]; items: MenuItem[] }`, `getPublishedMenu(): Promise<PublishedMenu>`, `parsePublishedMenu(input: unknown): PublishedMenu`. RPC returns allowlisted camelCase JSON. Source metadata optional in display types; selectors take explicit published items, deduplicate by ID.

- [ ] Write tests for new category ordering, missing source metadata, bad reference/price/duplicate IDs, fallback translations; anonymous RPC draft/mock filtering and table denial.
- [ ] Run tests before implementation; expected missing module/function failure.
- [ ] Implement RPC/projection/client/parser, dynamic consumers, localized unavailable/empty states; no static fallback. Preserve original file repo as historical fixture.
- [ ] Run focused unit tests and DB tests; expected PASS. Build/typecheck after consumer conversion.
- [ ] Commit Task 1 with evidence in execution ledger.

### Task 2: Content/options and order configuration

**Files:** create migration `20261005000500_catalog_extensions.sql`, `src/features/catalog/extensions/{schemas,repository,actions}.ts`, option/content/schedule forms, `/admin/settings/page.tsx`; modify protected item page/nav; test extension validation/actions/forms and DB permissions.

**Interfaces:** consumes item/category tables/version/audit and Task 1 public RPC. Produces `getItemExtensions(id)`, `saveItemExtensions(FormData)`, `getOrderSettings()`, `saveOrderSettings(FormData)`, `setOrdersPaused(FormData)` and transactional RPCs. JSON payload carries full option groups with stable IDs; item version shared by every item mutation.

- [ ] Write validation tests for min/max, active count, duplicates/limits, noninteger prices and schedules; write rollback/owner/staff/revoked/conflict/audit integration assertions.
- [ ] Run tests; expected missing implementation failure.
- [ ] Implement additive columns/options/schedule, guarded RPCs and audit; default schedule closed/paused with 20 minute prep. Add usable VI admin forms with draft preservation/conflict feedback.
- [ ] Extend public allowlist with descriptions/options/order settings; no source metadata. Run focused tests and integration; expected PASS.
- [ ] Commit Task 2 with ledger evidence.

### Task 3: Owner image management

**Files:** create Storage migration `20261005000600_catalog_images.sql`, `src/features/catalog/images/{validation,service}.ts`, upload route and image form; modify image renderer/config; test real Sharp decode and route access/cleanup.

**Interfaces:** consumes item version/content RPC; produces `normalizeMenuImage(bytes, mime): Promise<Buffer>`, owner upload route with same-origin/body limits and conditional image attach. Storage key generated by server; local asset allowlist is derived from repository inventory.

- [ ] Write tests for fake MIME, corrupt image, byte/pixel bounds, output metadata/dimensions, unauthorized/path injection/attach conflict and cleanup.
- [ ] Run tests; expected missing implementation failure.
- [ ] Implement Storage policies/bucket limits, decoder, upload/attach and existing asset selection, public URL/fallback and owner UI.
- [ ] Enable local Storage for real integration; run focused tests and Storage policies tests; expected PASS.
- [ ] Commit Task 3 with ledger evidence.

### Task 4: Verify, staging and handoff

**Files:** update roadmap/runbook; create `docs/navido-commerce-step-1-acceptance.md`; generated Supabase types updated after migrations.

**Interfaces:** consumes all previous tasks. Produces verified staging Preview and documented remaining actual browser acceptance.

- [ ] Run full unit/component, integration, DB checks, lint, typecheck, build without credentials, changed-file format and diff checks; expected all PASS.
- [ ] Request one independent final review against spec/plan/rulings; fix important findings with failing tests before implementation.
- [ ] Verify staging ref, snapshot app data and migration dry-run before push. Apply reviewed additive migrations and deploy Preview; verify anonymous public projection and HTTPS routes, retain protected admin.
- [ ] Update acceptance with exact counts/deployment/evidence and pending owner/staff HTTPS. Commit. Preserve branch; do not merge/push/promote production.
