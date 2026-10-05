# NAVIDO Commerce Step 0 — Foundation và Menu Admin Implementation Plan

> **For agentic workers:** Use `superpowers:executing-plans` to implement this plan task-by-task, or `superpowers:subagent-driven-development` if the owner selects parallel agents. Implementation was authorized by the owner on 2026-10-05. Remote deployment remains pending infrastructure setup.

**Goal:** Deploy nền tảng Next.js + PostgreSQL + đăng nhập nhân viên, import menu hiện có vào DB và quản lý danh mục/món tại `/admin/menu`, có kiểm tra kết nối được bảo vệ.

**Architecture:** Giữ backend trong Next.js trên Vercel. Supabase cung cấp PostgreSQL và Auth; server xác minh user và đọc membership bằng quyền user, RLS bảo vệ dữ liệu. Public website tiếp tục dùng dữ liệu hiện tại và không phụ thuộc Supabase ở build time.

**Tech Stack:** Next.js/React/TypeScript/next-intl hiện có; thêm `@supabase/supabase-js`, `@supabase/ssr`, `server-only`; Supabase CLI được pin cho migration và test DB; Vitest cho unit/component/integration, Supabase local cho RLS tests.

**Spec:** [Overall plan và quyết định thiết kế](2026-10-05-navido-commerce-overall.md), đặc biệt mục 1–2 và bước 0. Các quyết định chi tiết của bước 0 nằm ngay dưới đây.

**Status:** Đã implement và kiểm tra local ngày 2026-10-05: foundation, Auth, catalog/import và admin. Staging/production chưa provision/deploy; chủ quán xác nhận chưa có hạ tầng. Bằng chứng và hướng dẫn tại [runbook](../../navido-commerce-infrastructure.md). Các checklist chi tiết dưới đây giữ làm tiêu chí nghiệm thu đầy đủ, không được coi là đã pass trên remote.

**Scope update:** Chủ dự án chọn gộp migration menu và quản lý admin vào bước 0. Website khách tiếp tục đọc file; chuyển website sang DB thuộc bước 2. Bước 1 còn tùy chọn món, ảnh upload và cấu hình vận hành.

## Global Constraints

- Không viết hoặc chạy E2E/Playwright trong chuỗi triển khai này, bao gồm các script `verify:*` gọi Playwright. Giữ các test có sẵn. Dùng unit, component, integration và kiểm tra thủ công có ghi kết quả.
- Giữ Node/pnpm và dependency hiện tại của repo; không upgrade Next.js để làm task này. Đọc tài liệu phiên bản cài sẵn theo `AGENTS.md` trước khi viết code.
- Website khách giữ `vi`, `en`, `ko`; admin tiếng Việt tại `/admin`, không nằm dưới `[locale]`.
- Giữ raw `menu.json` và normalized menu hiện có làm nguồn import lịch sử; không sửa nội dung nguồn hoặc giao diện marketing. Cho phép chỉnh menu trong DB qua admin; không thêm schema đơn hàng trong bước 0.
- Không có public signup. Xác thực user không tự cấp quyền admin.
- Build và route public không được gọi Supabase hoặc đòi env Supabase. Route admin chưa cấu hình trả lỗi tạm không khả dụng và fail closed.
- Không ghi token, password, cookie hoặc secret vào log/git; không dùng service-role/secret key cho request người dùng.
- Việc provision dịch vụ cần tài khoản/quyền và ngân sách người dùng cung cấp; tài liệu local có thể hoàn tất trước, production chỉ được đánh dấu xong sau deploy thật.

## Review Focus

1. User Supabase hợp lệ nhưng không có membership không được vào admin — task 0.2 và 0.4.
2. User tự thêm/sửa membership hoặc bật lại membership bị khóa bị RLS/grant từ chối — task 0.2.
3. Session cookie cũ/giả hoặc DB lỗi không mở quyền, refresh giữ đúng cookie trên response — task 0.3 và 0.4.
4. Proxy không đưa admin vào i18n và API không trả redirect HTML — task 0.3 và 0.5.
5. Import không mất bản ghi hoặc ghi đè chỉnh sửa; staff không sửa giá/nội dung kể cả gọi Data API trực tiếp; build/public không phụ thuộc DB — task 0.6–0.9.

## Hành vi được chốt cho bước 0

### Môi trường và cấu hình

- Local dùng Supabase CLI + Docker khi có sẵn; nếu máy chưa có Docker, dùng project staging riêng để smoke thủ công, ghi rõ RLS tests chưa chạy, không đánh dấu gate đó pass.
- Khi máy triển khai thiếu Docker, chạy task 0.2 và integration/RLS gates trên máy khác hoặc CI có Docker, dùng Supabase local cùng commit và CLI đã pin. Generate types ở môi trường đó, đưa file về cùng commit và ghi commit SHA, phiên bản CLI, lệnh/kết quả vào runbook. Staging smoke không thay thế các gate này; chưa có môi trường chạy thì chỉ hoàn thành phần không phụ thuộc DB, chưa được release hoặc đánh dấu bước 0 hoàn tất.
- Vercel Preview dùng Supabase staging; Production dùng Supabase production riêng. Không dùng DB production cho preview hoặc unit/integration tests.
- Chọn vùng Vercel/Supabase gần nhau tại Singapore nếu tài khoản/gói cung cấp; người triển khai kiểm tra danh sách vùng và chi phí lúc provision. Nếu không có vùng này, ghi lựa chọn thực tế trước deploy thay vì tự đổi nhà cung cấp.
- Env runtime: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`; giữ cả hai chỉ đọc phía server ở bước này vì form gửi Server Action, không cần Supabase browser client. `NEXT_PUBLIC_SITE_URL` hiện tại giữ đúng chính sách domain đã xác minh.
- Không cần `SUPABASE_SECRET_KEY`/service-role ở runtime bước 0. Quản trị membership bằng dashboard/SQL Editor của chủ quán. CLI migration credential chỉ ở local/CI được bảo vệ.
- `.env.example` chứa placeholder, hướng dẫn môi trường; không có giá trị key thật. Supabase env được đọc lười trong hàm server, không parse bắt buộc ở module import.
- Dùng Supabase Data API cho query ứng dụng bước 0, SQL migration qua CLI; không thêm ORM hay pool kết nối DB trực tiếp.

### Schema và quyền

`public.admin_memberships`:

| Cột | Kiểu / điều kiện |
| --- | --- |
| `user_id` | uuid primary key, references `auth.users(id)` on delete cascade |
| `role` | text not null, check (`role in ('owner', 'staff')`), không có default |
| `is_active` | boolean not null default false |
| `created_at` | timestamptz not null default now() |

RLS bật. `authenticated` được SELECT dòng có `user_id = auth.uid()`; `anon` không đọc. Cả hai không được INSERT/UPDATE/DELETE. Không tạo trigger cấp membership khi signup. User có thể đọc dòng inactive của mình nhưng server chỉ cho vào khi `is_active=true`.

Guard kiểm tra role ở runtime: chỉ `owner` hoặc `staff` mới được tạo `AdminActor`. Role null/không hợp lệ trả `forbidden`, không ép kiểu để bỏ qua kiểm tra. SQL tests kiểm tra cả constraint role bằng quyền quản trị fixture, ngoài các kiểm tra grant/RLS bằng quyền user.

Bootstrap chủ quán: tắt signup ở Supabase, tạo confirmed Auth user qua công cụ quản trị, thêm membership `owner` active bằng SQL Editor. Credential đăng nhập do chủ quán thiết lập/chuyển an toàn, không commit password. Không hardcode email chủ quán hoặc tự tạo user ở migration. Recovery/cấp thêm user qua dashboard trong bước 0; giao diện quản lý tài khoản chưa thuộc bước này.

### Session và routes

- `/admin/login`: form email/password, không có signup; gửi Server Action. Login thành công luôn đến `/admin`, không nhận arbitrary return URL.
- `/admin`: trang nền tảng cho nhân viên được cấp quyền, hiện email/vai trò, nút đăng xuất và kết quả kiểm tra kết nối riêng tư. Không dựng dashboard doanh thu giả.
- `/api/admin/health`: `GET`, có xác thực và membership; trả JSON `{status:'ok'}` khi đã đọc DB thành công, 401 chưa xác thực, 403 thiếu quyền, 503 dịch vụ/cấu hình lỗi. `Cache-Control: no-store`, không trả key, URL DB, token hay chi tiết SQL.
- Page admin dùng layout riêng tại `src/app/admin/layout.tsx` gồm `<html lang="vi">`, `<body>`, CSS/font dùng chung; không lồng root layout public.
- Protected group tại `src/app/admin/(protected)`; login bên ngoài group. Guard layout phục vụ điều hướng, nhưng mọi mutation/API sau này phải tự gọi guard, không tin layout.
- Session cookie do Supabase SSR quản lý; server dùng `auth.getUser()` để xác minh thay vì tin dữ liệu `getSession()` chưa kiểm chứng. Membership đọc lại trên mỗi request có quyền, không cache xuyên request.
- Proxy hiện nằm ở root `proxy.ts`. Nhánh `/admin` và `/api/admin` refresh auth cookie; nhánh locale giữ next-intl; API webhook tương lai không chạy i18n/auth session.
- Matcher gồm `/admin/:path*`, `/api/admin/:path*` và matcher public hiện có. Nhánh auth chỉ khớp pathname bằng `/admin` hoặc bắt đầu `/admin/`, bằng `/api/admin` hoặc bắt đầu `/api/admin/`; `/administrator` và `/api/admin-other` không thuộc nhánh auth. URL admin có dấu chấm vẫn phải chạy proxy. Test dùng helper matcher của Next.js phiên bản cài sẵn để kiểm tra `config.matcher`, ngoài test gọi hàm proxy trực tiếp.
- Khi SDK refresh, áp dụng cookie lên request cho downstream và response cho browser, giữ toàn bộ cookie chunks/options cùng cache headers SDK cung cấp cho `setAll`. Nếu tạo response thay thế, phải chuyển các cookie/header này; không ghi đè thành cache public. Response admin, gồm login, redirect và lỗi, dùng `Cache-Control: private, no-store`; health dùng `no-store` như trên. Proxy tiếp tục downstream để page/API tự xử lý quyền, không chuyển API thành redirect HTML.
- Invalid credentials trả thông báo chung; user hợp lệ nhưng không có membership không được cấp quyền. Lỗi mạng/provider/DB hiện tạm không khả dụng, không được giả thành login thành công.
- Login/signout dùng Server Actions với kiểm tra origin của framework, không dùng GET để đăng xuất. Supabase Auth rate limit được cấu hình; không đặt rate limiter in-memory trên Vercel.
- Logout gọi `auth.signOut({ scope: 'local' })`, chỉ thu hồi phiên hiện tại. Thành công redirect cố định `/admin/login`; lỗi provider/network trả `LogoutState` với `unavailable`, không redirect như thành công. UI hiển thị “Chưa xác nhận được việc thu hồi phiên. Vui lòng thử đăng xuất lại.” và cho thử lại; không khẳng định token đã bị thu hồi chỉ vì cookie đã bị xóa.
- Sau `signInWithPassword`, xác minh user và membership trước redirect. Nếu membership thiếu/inactive/role sai, cleanup phiên vừa tạo bằng `signOut({ scope: 'local' })` rồi trả `forbidden`; nếu kiểm tra quyền lỗi hạ tầng, cleanup rồi trả `unavailable`. Cleanup thất bại cũng trả `unavailable`, không redirect; session còn lại không được vượt guard. Không revoke các phiên khác của user. Logout không yêu cầu membership active, để user bị thu hồi quyền vẫn có thể đăng xuất.
- Trang admin/API là dynamic/no-store và noindex. Không thêm admin vào sitemap hoặc navigation khách.

### Menu DB, import và quản lý

- Nguồn import: `src/features/menu/data/normalized-menu.generated.json`, được đối chiếu bằng `validate:menu` với `menu.json`. Baseline hiện tại có 14 danh mục và 130 bản ghi, gồm 3 bản ghi `MOCK_BEANS`. Giữ tất cả bản ghi, kể cả nghi trùng và Extras; không gộp/xóa tự động. Giữ `needsReview`, `reviewNotes`, `sourceName`, `sourceCategoryCode`, `sourceRow` và `netWeightGram` để nhân viên rà soát.
- Dùng ID text hiện có cho danh mục/món import; ID và source metadata không đổi khi chuyển danh mục hoặc sửa tên. Bản ghi tạo trong admin dùng UUID do server tạo, lưu dạng text, source metadata null. `source_row` nullable unique cho món import; không phát sinh source row giả cho món mới.
- `public.menu_categories`: `id text primary key`, `name_vi text not null` không trắng, `name_en/name_ko text not null default ''`, `sort_order integer not null`, `source_category_codes text[] not null default '{}'`, `version integer not null default 1`, `created_at/updated_at timestamptz not null default now()`, `updated_by uuid nullable`. Mọi version phải dương; source category codes chỉ đọc sau import.
- `public.menu_items`: `id text primary key`, `category_id text not null` FK danh mục `on delete restrict`; tên ba ngôn ngữ như danh mục; `price_vnd integer not null check >= 0`, `sort_order integer not null`; `publication_status text not null default 'draft'` check `draft | published | archived`; `is_available boolean not null default true`; `source_row integer nullable unique check > 0`, `source_name/source_category_code text nullable`, `needs_review boolean not null default false`, `review_notes text[] not null default '{}'`, `net_weight_gram integer nullable check > 0`; version/timestamps/updated_by như danh mục. `updated_by` tham chiếu Auth user với `on delete set null`.
- Món đang hiển thị theo `localMenuRepository` được import thành `published`; món `getMenuPublicationStatus(item) === 'hidden'` thành `draft`. Đây là trạng thái DB phục vụ bước 2, không tự đổi website ở bước 0. UI ghi rõ “Website hiện vẫn dùng menu từ file; thay đổi tại đây chưa xuất hiện trên website”. Món mock không có trong preview nội bộ phần published. Tên/dịch fallback và giá được giữ nguyên; không tự coi các bản dịch hiện có là đã được duyệt.
- `/admin/menu`: danh sách món, tìm tên cả ba ngôn ngữ, lọc danh mục/trạng thái/cần review, giá, trạng thái còn bán; owner thêm/sửa tên, giá, danh mục, thứ tự, trọng lượng, trạng thái công bố và đánh dấu đã review. `/admin/menu/categories` thêm/sửa tên/thứ tự danh mục; `/admin/menu/new`, `/admin/menu/[id]` tạo/sửa món; `/admin/menu/preview` xem menu DB published theo thứ tự danh mục/món, fallback tên VI khi EN/KO trống. Không có hard delete; món ngừng dùng được archive, danh mục không dùng có thể để rỗng. Không triển khai upload ảnh hoặc cấu hình size/đường/đá ở bước này.
- Active owner và staff được đọc menu; chỉ owner được insert/update danh mục/món. Anonymous, user không membership và inactive không được đọc/ghi. Không cấp DELETE hoặc quyền ghi audit. Staff chỉ đổi `is_available` qua RPC hẹp `set_menu_item_availability(p_item_id text, p_is_available boolean, p_expected_version integer)`; RPC tự kiểm tra `auth.uid()` và membership active owner/staff, không nhận role/user ID/payload tùy ý. Không dùng service-role ở runtime.
- RPC availability dùng `SECURITY DEFINER` vì staff không có quyền update bảng trực tiếp; `search_path = ''`, tên object đầy đủ schema, revoke EXECUTE từ PUBLIC/anon, chỉ grant authenticated. Function chỉ update availability khi ID/version khớp; membership không hợp lệ báo forbidden, món không tồn tại báo not_found, version cũ báo conflict. Không cấp quyền gọi trực tiếp các trigger functions.
- Mỗi mutation gọi `requireAdmin()` và kiểm tra role, rồi DB kiểm tra lại membership qua RLS/RPC. Update owner có điều kiện `id + expected_version`; zero rows phân loại lại quyền/not_found/conflict, không báo thành công. Trigger DB tăng version và cập nhật timestamp/actor từ `auth.uid()`, không tin field audit từ form. Source metadata và ID bất biến được trigger bảo vệ. Hai người sửa cùng bản ghi: người lưu sau nhận conflict và phải tải lại; không ghi đè âm thầm.
- `public.menu_audit_events`: `id bigint generated always as identity primary key`, `entity_type text not null` check `category | item`, `entity_id text not null`, `operation text not null` check `insert | update`, `actor_id uuid nullable` FK Auth user `on delete set null`, `occurred_at timestamptz not null default now()`, `before_data jsonb nullable`, `after_data jsonb not null`. Trigger ghi audit cùng transaction với thay đổi; dùng definer trong schema `private` với search_path cố định, không mở RPC ghi audit. Owner đọc audit, staff không đọc; user không thể tự sửa/xóa lịch sử. Import qua migration có actor null, không giả danh owner. Version và audit áp dụng cả thay đổi availability qua RPC.
- Import là migration dữ liệu riêng sau migration schema, sinh SQL deterministic từ normalized JSON bằng script local; escape SQL string đúng, không nội suy thủ công. Category insert trước item, `ON CONFLICT (id) DO NOTHING`; không UPDATE hoặc DELETE khi chạy lại. Kiểm tra nguồn, duplicate ID/source row, FK và checksum trước sinh file; một transaction, lỗi không để import một phần. Migration không đọc file runtime, không kết nối DB khi build và không chứa credential.
- Lưu manifest import gồm checksum SHA-256 của raw/normalized nguồn, số lượng và danh sách ID/trạng thái dự kiến. Đối chiếu DB sau import về ID/danh mục/tên/giá/thứ tự/metadata/trạng thái trước bàn giao. Nếu đã có món chỉnh sửa, rerun giữ nguyên; báo khác biệt để review, không tự sửa. Backup/snapshot DB trước khi áp dụng lên DB có dữ liệu; rollback ứng dụng giữ menu/audit. Import source chỉ chạy bởi CLI quản trị sau xác minh project ref, không có nút import bằng quyền user.

## File map và interfaces

| Nhóm | File dự kiến | Trách nhiệm |
| --- | --- | --- |
| Env/client | `src/lib/server-env.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/update-session.ts` | Cấu hình server, client theo request, cookie refresh |
| DB | `supabase/config.toml`, `supabase/migrations/*_admin_memberships.sql`, `supabase/tests/database/admin-memberships.test.sql` | Schema, quyền, test DB |
| Auth domain | `src/features/admin-auth/types.ts`, `access.ts`, `actions.ts` | Kết quả truy cập, xác thực/quyền, login/logout |
| UI | `src/app/admin/layout.tsx`, `login/page.tsx`, `(protected)/layout.tsx`, `(protected)/page.tsx`, `src/features/admin-auth/components/login-form.tsx` | Routes, form và shell nhỏ |
| API | `src/app/api/admin/health/route.ts` | Health được bảo vệ |
| Catalog DB/import | `supabase/migrations/*_menu_catalog.sql`, `*_import_initial_menu.sql`, `supabase/tests/database/menu-catalog.test.sql`, `scripts/generate-menu-import.ts`, `docs/menu-db-import-manifest.json` | Schema, RLS/RPC/audit, import nguồn và đối chiếu |
| Catalog server | `src/features/catalog/{types,schemas,repository,actions}.ts` | Model admin DB, validation, query/mutation có quyền |
| Catalog UI | `src/app/admin/(protected)/menu/{page,new/page,[id]/page,categories/page,preview/page}.tsx`, `src/features/catalog/components/{menu-list,item-form,category-form,availability-form}.tsx` | Quản lý menu DB, preview và pending/errors |
| Wiring | `proxy.ts`, `.env.example`, `package.json`, `pnpm-lock.yaml`, `vitest.integration.config.ts` | Routing, dependencies, commands |
| Handoff | `docs/navido-commerce-infrastructure.md`, `README.md` | Môi trường, provision, migration, recovery, rollback |

Tên/thư mục trên là tương đối từ application worktree `.worktrees/navido-website`, không phải repo root chỉ có nguồn asset.

```ts
type AdminActor = { userId: string; email: string; role: 'owner' | 'staff' };
type AdminAccess =
  | { status: 'allowed'; actor: AdminActor }
  | { status: 'unauthenticated' }
  | { status: 'forbidden' }
  | { status: 'unavailable' };

// src/lib/server-env.ts (server-only)
getSupabaseServerEnv(): { url: string; publishableKey: string };
// Throws a configuration error without including secret values.

// src/lib/supabase/server.ts (server-only)
createServerSupabaseClient(): Promise<SupabaseClient<Database>>;

// src/lib/supabase/update-session.ts
updateAdminSession(request: NextRequest): Promise<NextResponse>;

// src/features/admin-auth/access.ts (server-only)
getAdminAccess(): Promise<AdminAccess>;
requireAdmin(): Promise<AdminActor>; // throws typed AdminAccessError for non-allowed results

// src/features/admin-auth/actions.ts ('use server')
signInAdmin(previousState: LoginState, formData: FormData): Promise<LoginState>;
signOutAdmin(previousState: LogoutState, formData: FormData): Promise<LogoutState>;
```

`Database` được generate từ migration local vào `src/lib/supabase/database.types.ts`. `LoginState` chứa error code `invalid_input | invalid_credentials | forbidden | unavailable` hoặc null; UI map sang tiếng Việt. Redirect thành công do action thực hiện, không phải URL do client cung cấp.

`LogoutState` là `{ error: 'unavailable' | null }`, initial state `{ error: null }`; dùng action state để hiển thị lỗi và pending. Action redirect chỉ sau logout thành công; không nhận URL đích từ `FormData`. UI logout dùng component `src/features/admin-auth/components/logout-form.tsx`, test tại `tests/components/admin-logout.test.tsx`.

Catalog types ở `src/features/catalog/types.ts`: `PublicationStatus = 'draft' | 'published' | 'archived'`; `CategoryInput` gồm `name: {vi,en,ko}` và `sortOrder`; `ItemInput` thêm `categoryId`, `priceVnd`, `publicationStatus`, `isAvailable`, `netWeightGram: number | null`, `needsReview`. ID là string, version là number nguyên dương trong range PostgreSQL integer; DB overflow phải trả lỗi và rollback, không wrap version; metadata source/audit chỉ đọc. `CatalogItem/Category` gồm input fields, `id`, `version` và metadata tương ứng schema. `CatalogFilters` gồm query/categoryId/publicationStatus/needsReview, tất cả optional. `CatalogActionState = { error: 'invalid_input' | 'forbidden' | 'not_found' | 'conflict' | 'unavailable' | null; fieldErrors?: Record<string, string> }`.

`repository.ts` là server-only: `listCatalog(filters: CatalogFilters): Promise<{categories: CatalogCategory[]; items: CatalogItem[]}>`, `getCatalogItem(id: string): Promise<CatalogItem | null>`, `getCatalogPreview(): Promise<{categories: CatalogCategory[]; items: CatalogItem[]}>` đều gọi guard, query user client, không cache xuyên request. Server Actions `saveMenuItem`, `saveMenuCategory`, `setMenuAvailability` có signature `(previousState: CatalogActionState, formData: FormData): Promise<CatalogActionState>`; parse fields whitelist, owner mutations kiểm tra role owner, availability cho active owner/staff. Input có ID + expectedVersion khi update; create không nhận ID từ client. Thành công revalidate các route admin menu liên quan và redirect cố định `/admin/menu` hoặc `/admin/menu/categories`, không invalidate public menu ở bước 0.

## Task 0.1 — Cấu hình server và tooling

**Files:** `.env.example`, `package.json`, lockfile, `src/lib/server-env.ts`, `tests/unit/server-env.test.ts`, `.gitignore`, `supabase/config.toml`, `vitest.integration.config.ts`.

**Produces:** `getSupabaseServerEnv()`; scripts `db:start`, `db:stop`, `db:test`, `db:types`, `test:integration`. Integration config dùng Node, chỉ include `tests/integration/**/*.test.ts`, không inherit setup jsdom.

- [ ] Đọc hướng dẫn Next.js cài sẵn liên quan cookies, proxy, Server Actions, Route Handlers và root layouts; kiểm tra phiên bản Supabase SDK/CLI tương thích, pin trong lockfile.
- [ ] Viết unit tests: env hợp lệ trả URL/key; thiếu URL/key phát lỗi cấu hình không chứa value; import module không đòi env. Chạy `corepack pnpm exec vitest run tests/unit/server-env.test.ts`, xác nhận fail do chưa có implementation.
- [ ] Thêm dependencies và hàm env server-only. Cấu hình Vitest mock/alias `server-only` chỉ trong test nếu cần; không xóa ranh giới server-only trong production.
- [ ] Tạo config local và scripts: `db:start` = `supabase start`, `db:stop` = `supabase stop`, `db:test` = `supabase test db`, `test:integration` = `vitest run --config vitest.integration.config.ts`.
- [ ] `db:types` chạy script `scripts/generate-database-types.mjs` gọi CLI `supabase gen types typescript --local`, ghi `database.types.ts` bằng UTF-8, không in credential; script này thuộc task 0.2 khi đã có schema.
- [ ] Chạy test env, typecheck, build khi env Supabase không được cung cấp. Website phải build như baseline; không gọi `next dev` để tạo lại AGENTS ngoài nhu cầu.
- [ ] Review diff rồi commit task 0.1 khi thực hiện, chỉ stage file của task.

## Task 0.2 — Migration membership và RLS

**Files:** migration `supabase/migrations/<timestamp>_admin_memberships.sql`, DB test ở file map, generated types, script gen types.

**Consumes:** Supabase local configuration. **Produces:** schema/permissions ở thiết kế và generated `Database` type.

- [ ] Viết SQL tests với fixture user A, B, inactive C: A đọc được đúng dòng A; không đọc B; anon không đọc; authenticated không tự insert/update/delete; inactive không tự bật lại. Chạy DB tests trước migration để thấy schema chưa có.
- [ ] Thêm SQL constraint tests bằng quyền quản trị fixture: role null bị NOT NULL từ chối, role ngoài `owner | staff` bị CHECK từ chối; hai role hợp lệ được chấp nhận. Fixture nằm trong transaction rollback, không dùng việc bị grant từ chối để coi constraint đã được kiểm tra.
- [ ] Viết migration với FK/check/default/RLS và explicit grants/revokes. Dùng `supabase migration up` local để áp dụng; không dùng reset DB remote, không chạy destructive reset trên DB có dữ liệu.
- [ ] Chạy `corepack pnpm db:test`; tất cả policy assertions phải pass. Test fixture rollback sau chạy, không commit user/password thử nghiệm.
- [ ] Generate types từ local. Xác nhận `admin_memberships` xuất hiện và không có secret trong generated file.
- [ ] Review migration độc lập; commit schema + tests + generated types.

## Task 0.3 — Server client và proxy session

**Files:** `src/lib/supabase/server.ts`, `update-session.ts`, `proxy.ts`, `tests/unit/admin-proxy.test.ts`, `tests/unit/supabase-server.test.ts`.

**Consumes:** env, `Database`. **Produces:** `createServerSupabaseClient()`, `updateAdminSession()` và routing cookie refresh.

- [ ] Viết tests: `/admin/login`, `/admin`, `/api/admin/health` vào auth branch; `/vi/menu`, `/en`, `/ko/roastery` giữ intl; webhook `/api/webhooks/...` không vào intl; refresh cookie được giữ trên cả request/response đúng hướng dẫn SSR.
- [ ] Test matcher thực tế cho `/admin`, `/admin/login`, `/admin/report.csv`, `/api/admin/health`, `/api/admin/report.csv`; kiểm tra `/administrator`, `/api/admin-other`, webhook và public locales giữ đúng nhánh. Test refresh nhiều cookie chunks và cache headers SDK; response cuối cùng, gồm downstream redirect/401/403/503, giữ cookie refresh và không cache public.
- [ ] Chạy tests cho hai file, xác nhận fail trước implementation.
- [ ] Implement client theo cookie của request. Server Components không ghi cookie trực tiếp ngoài context cho phép; proxy/Server Actions đảm nhiệm cập nhật cookie theo SDK docs. Không dùng singleton chứa session user.
- [ ] Thêm matcher riêng `/admin/:path*` và `/api/admin/:path*` bên cạnh matcher public hiện có; xử lý auth routes theo ranh giới segment trước nhánh `isLocale`. Giữ cookie/cache headers trên response cuối cùng theo quyết định session ở trên. Không dùng proxy làm nơi duy nhất quyết định quyền membership.
- [ ] Khi env thiếu hoặc refresh lỗi, route bảo vệ vẫn đi qua guard để trả unavailable/unauthenticated; public branch không bị phụ thuộc env.
- [ ] Chạy focused tests và các unit i18n hiện có; commit task.

## Task 0.4 — Quyền admin và login/logout

**Files:** `src/features/admin-auth/{types,access,actions}.ts`, `tests/unit/admin-access.test.ts`, `tests/unit/admin-auth-actions.test.ts`, `tests/integration/admin-access.test.ts`.

**Consumes:** request client. **Produces:** `getAdminAccess`, `requireAdmin`, `signInAdmin`, `signOutAdmin`, `AdminAccessError`, `LoginState` và `LogoutState` như interface block.

- [ ] Viết unit tests cho verified user + active role được phép, không có user -> unauthenticated, không membership/inactive -> forbidden, DB/provider outage -> unavailable. Test `requireAdmin` chỉ trả actor khi allowed.
- [ ] Test role null/không hợp lệ -> forbidden dù membership active; lỗi session thiếu/hết hạn/giả -> unauthenticated, lỗi network/provider -> unavailable. Không gom mọi lỗi `getUser()` thành chưa đăng nhập; phân loại theo error codes của SDK đã pin.
- [ ] Viết action tests: email/password thiếu, sai mật khẩu, đúng mật khẩu nhưng thiếu quyền, redirect thành công đúng `/admin`, logout gọi provider và xóa session. Không đọc arbitrary `next` từ FormData; password không xuất hiện trong error/log.
- [ ] Test logout gọi scope `local`, thành công redirect `/admin/login`, provider/network lỗi trả `unavailable` không redirect; user inactive vẫn gọi được logout. Test login forbidden/unavailable cleanup phiên vừa tạo với scope `local`, cleanup lỗi trả unavailable, không redirect; mọi trường hợp từ chối vẫn không qua guard.
- [ ] Run focused tests để xác nhận fail, rồi implement bằng `auth.getUser()` và query membership theo user ID. Không dùng email allowlist làm nguồn quyền, không cache result xuyên request.
- [ ] Viết Node integration tests local cho hai user và thao tác revoke membership giữa hai request: request sau bị từ chối dù Auth session còn hạn. Fixture quản trị dùng credential local riêng chỉ trong process test.
- [ ] Run unit và integration. Integration command phải từ chối target không phải local Supabase và không tự lấy credential production.
- [ ] Integration local tạo hai phiên riêng cho cùng user, logout một phiên và xác nhận phiên kia vẫn được phép; phiên đã logout không truy cập được qua `getUser()` dù còn giữ cookie cũ. Ghi rõ môi trường Docker thực hiện nếu chạy trên máy khác/CI.
- [ ] Commit task sau khi kiểm tra log không chứa password/token.

## Task 0.5 — Routes admin và health

**Files:** UI/API trong file map; `src/features/admin-auth/components/logout-form.tsx`, `tests/components/admin-login.test.tsx`, `tests/components/admin-logout.test.tsx`, `tests/unit/admin-health.test.ts`, `tests/unit/admin-route-access.test.ts`.

**Consumes:** auth actions, access result. **Produces:** `/admin/login`, `/admin`, `/api/admin/health`.

- [ ] Viết component test cho label email/password, trạng thái pending chống submit lặp, lỗi có thể đọc bằng screen reader; không viết snapshot toàn bộ giao diện.
- [ ] Test logout form: pending chống submit lặp; `unavailable` hiển thị thông báo đã chốt với `role="alert"` và cho thử lại, không hiển thị thành công. Trang forbidden có logout form để user còn session có thể thoát.
- [ ] Viết route tests: health 200/401/403/503 đúng JSON và no-store; không có redirect HTML; page guard redirect người chưa login, forbidden cho user thiếu quyền, unavailable cho lỗi hạ tầng.
- [ ] Run tests để xác nhận fail. Implement root layout admin riêng, login ngoài protected group và landing page trong group. Không đặt auth guard ở root layout gây vòng lặp login.
- [ ] Implement health gọi guard/read membership; query membership đã chứng minh kết nối DB, không cần bảng health giả. Page hiển thị actor và trạng thái đơn giản; noindex, không cache dữ liệu user.
- [ ] Chạy unit/component mới, typecheck và production build. Kiểm tra thủ công local: login/logout, tải lại, dùng URL admin trực tiếp và public locales. Ghi thời điểm/kết quả; không chạy Playwright.
- [ ] Commit task.

## Task 0.6 — Catalog schema, quyền và audit

**Files:** `supabase/migrations/<timestamp>_menu_catalog.sql`, `supabase/tests/database/menu-catalog.test.sql`, `src/lib/supabase/database.types.ts`.

**Consumes:** membership schema task 0.2. **Produces:** catalog tables, RLS, availability RPC, audit/version triggers theo quyết định Menu DB.

- [ ] Viết SQL tests cho owner active, staff active, inactive, authenticated không membership và anon: quyền đọc/ghi đúng; staff không sửa giá/tên qua Data API trực tiếp, chỉ đổi availability qua RPC. Test gọi RPC giả role/user, anon execute, inactive sau revoke, audit insert/update/delete trái phép đều bị từ chối.
- [ ] Test constraint tên VI trắng, giá âm/noninteger, category FK sai, status sai, version không dương, source row trùng; test trigger ngăn sửa ID/source, tự đặt actor/version và audit atomic. Hai update cùng expected version chỉ một thành công; RPC version cũ trả conflict, món không tồn tại not_found.
- [ ] Run `corepack pnpm db:test`, xác nhận fail do chưa có catalog schema; implement migration và explicit grants/revokes/search_path. Owner RLS dựa membership hiện tại, không tin claim role do client cung cấp.
- [ ] Áp dụng local migration; chạy `corepack pnpm db:test` PASS và `corepack pnpm db:types`. Review quyền definer độc lập, commit schema/tests/types.

## Task 0.7 — Import menu hiện có vào DB

**Files:** `scripts/generate-menu-import.ts`, `supabase/migrations/<timestamp>_import_initial_menu.sql`, `docs/menu-db-import-manifest.json`, `tests/unit/menu-import.test.ts`, `tests/integration/menu-import.test.ts`, `package.json`.

**Consumes:** normalized menu, catalog schema. **Produces:** seed migration tự đủ dữ liệu và manifest kiểm chứng; script `menu:import:generate` = `tsx scripts/generate-menu-import.ts` (chỉ sinh file, không apply DB).

- [ ] Viết unit tests import đủ 130 items/14 categories baseline, giữ ID/giá/locale/thứ tự/metadata/trọng lượng, 3 MOCK_BEANS draft, món hiện public published; dữ liệu nghi trùng không mất, Extras giữ nguyên. Test apostrophe/unicode được escape đúng, source row/ID trùng bị từ chối và output/checksum deterministic.
- [ ] Run `corepack pnpm exec vitest run tests/unit/menu-import.test.ts` FAIL, implement generator schema validation dùng Zod hiện có, serialize SQL và manifest; chạy `corepack pnpm validate:menu` trước generate. Khi nguồn checksum/count thay baseline, báo khác biệt và review trước apply, không tự regenerate seed đã deploy.
- [ ] Run unit PASS, generate migration và manifest; rà không có credential, không có UPDATE/DELETE, insert danh mục trước món trong transaction. Generated SQL là migration kiểm soát trong git, không chạy generator tại build.
- [ ] Integration Supabase local: import lần đầu đối chiếu mọi trường với manifest; chạy lại cùng payload không nhân bản; owner sửa tên/giá/chuyển category rồi rerun không ghi đè; fixture lỗi chứng minh rollback toàn transaction. Không chạy integration này trên remote.
- [ ] Chạy `corepack pnpm test:integration`, `corepack pnpm db:test`, regenerate types nếu cần; commit import/tests/manifest. Lưu bằng chứng local có Docker.

## Task 0.8 — Quản lý menu và preview trong admin

**Files:** catalog server/UI trong file map, `tests/unit/catalog-{validation,actions,repository}.test.ts`, `tests/components/catalog-{forms,list}.test.tsx`, `tests/integration/catalog-access.test.ts`, admin landing page thêm link Menu.

**Consumes:** task 0.4 guard/client, task 0.6 schema/RPC và task 0.7 dữ liệu. **Produces:** routes `/admin/menu`, `/admin/menu/new`, `/admin/menu/[id]`, `/admin/menu/categories`, `/admin/menu/preview`; server interfaces theo block catalog.

- [ ] Viết unit validation tests cho tên VI bắt buộc, giá VND nguyên >=0 trong range PostgreSQL integer, sortOrder integer trong range, trọng lượng nguyên dương/null, status whitelist; name EN/KO trống được preview fallback VI. Form không nhận source metadata/actor/version mới/role từ client; expectedVersion parse thành integer dương trong range PostgreSQL integer.
- [ ] Viết repository/action tests: mỗi request tự guard; owner CRUD create/update/archive, staff chỉ availability; forbidden/unavailable/not_found/conflict không báo success; expected version stale yêu cầu reload, không ghi đè. Category save owner-only, FK/món category sai bị từ chối; query lọc/tìm kiếm coi ký tự đặc biệt là dữ liệu, không ghép raw PostgREST filter từ input.
- [ ] Run focused unit tests FAIL rồi implement server types/schemas/repository/actions. Update có version predicate và kiểm tra affected row; availability gọi RPC cố định. DB trigger sở hữu version/actor/audit, không dùng nhiều request rời để ghi audit. Input ID category được kiểm tra trước insert/update và DB vẫn giữ FK.
- [ ] Viết component tests cho search/filter, form labels/field errors, pending, warning website còn đọc file, source metadata read-only, cần review, archive, staff không có nút sửa giá/nội dung. Preview chỉ published, thứ tự ổn định dùng ID làm tie-break, món draft/mock/archived không xuất hiện; món tạm hết vẫn hiện nhãn “Tạm hết”.
- [ ] Implement UI tiếng Việt, link Menu tại landing, routes protected dynamic/noindex/no-store; lỗi DB không fallback âm thầm về file. Form owner sửa món có thể đánh dấu review xong nhưng giữ review notes nguồn. Không thêm navigation admin vào website khách.
- [ ] Integration local gọi bằng owner/staff và trực tiếp Data API/RPC để chứng minh UI không phải lớp bảo vệ duy nhất; revoke membership trước mutation kế tiếp bị từ chối. Kiểm tra audit/actor/version sau tạo/sửa/archive/availability.
- [ ] Run `corepack pnpm test`, `corepack pnpm test:integration`, `corepack pnpm db:test`, `corepack pnpm typecheck`, `corepack pnpm build` khi thiếu Supabase env. Smoke thủ công local/staging: import, tạo/sửa/archive món, danh mục, preview, staff availability, reload, conflict hai tab và public locales; ghi kết quả, không Playwright. Commit task.

## Task 0.9 — Provision, deploy và bàn giao

**Files:** `docs/navido-commerce-infrastructure.md`, `README.md`; chỉ thêm `vercel.json` nếu cần cấu hình vùng đã xác minh.

**Consumes:** code/migration Auth + catalog/import đã kiểm tra. **Produces:** staging có login và quản lý menu DB hoạt động; production hoạt động nếu chủ quán đã cấp tài khoản/quyền và đồng ý triển khai.

- [ ] Ghi runbook: tạo hai project Supabase, vùng/plan đã chọn, Vercel project, env mapping, tắt signup, bootstrap owner, cách thu hồi user, migration và backup theo khả năng gói thực tế. Không ghi credential hoặc password vào tài liệu.
- [ ] Kiểm tra tài khoản dịch vụ hiện hữu và quyền; không tự mua gói. Nếu thiếu, ghi đúng đầu vào chủ quán cần cung cấp; vẫn hoàn thành code/local checks và phân biệt trạng thái chưa deploy.
- [ ] Xem danh sách migration pending và xác minh project ref staging trước khi apply CLI migration. Deploy Vercel Preview trỏ staging, tạo owner staging qua dashboard, kiểm tra thủ công quyền và health.
- [ ] Apply schema catalog rồi migration import ở staging; đối chiếu manifest/count/IDs/giá/trạng thái/metadata. Kiểm tra `/admin/menu` bằng owner và staff; ghi rõ website chưa đọc DB. Trước production xác minh checksum nguồn, backup nếu DB có dữ liệu, kiểm tra pending migrations/project ref và giữ dữ liệu chỉnh sửa khi rerun import.
- [ ] Run gate: `corepack pnpm lint`, `corepack pnpm typecheck`, `corepack pnpm test`, `corepack pnpm test:integration`, `corepack pnpm db:test`, `corepack pnpm build`. Không chạy E2E hoặc `verify:*`. Chỉ format/check các file thay đổi.
- [ ] Hoàn thành integration/RLS gates và generate types trên Supabase local có Docker trước release; ghi commit SHA/môi trường/lệnh/kết quả, kể cả khi máy khác/CI thực hiện. Gate chưa chạy hoặc fail chặn release, staging smoke không thay thế. Ghi cấu hình Auth rate limit thực tế và logout scope trong runbook.
- [ ] Nếu production đã được cho phép: xác minh project ref production, apply migration, set env riêng, deploy, bootstrap owner production. Migration thêm bảng tương thích nên deploy cũ vẫn chạy.
- [ ] Ghi bằng chứng acceptance bên dưới. Khi rollback, quay về deployment trước; giữ schema/dữ liệu membership. Không tự drop table hay reset database.
- [ ] Commit tài liệu bàn giao và báo rõ phần nào local/staging/production đã được xác minh.

## Acceptance checklist

- [ ] Public `/`, `/vi`, `/en`, `/ko` và trang menu giữ hành vi hiện có; build không cần Supabase chạy.
- [ ] `/admin/login` không bị redirect thành route locale; admin dùng layout riêng.
- [ ] Matcher admin vẫn chạy với URL có dấu chấm; đường dẫn gần giống không vào nhánh auth. Refresh giữ cookie chunks/cache headers trên response cuối cùng và mọi response admin không cache public.
- [ ] Owner active đăng nhập, reload và đăng xuất được trên deployment HTTPS.
- [ ] User authenticated không có membership, inactive user và anonymous bị từ chối đúng cách.
- [ ] Role null/sai bị constraint và guard từ chối; login thiếu quyền cleanup phiên vừa tạo. Logout scope local không ảnh hưởng phiên khác; lỗi provider hiển thị trạng thái chưa xác nhận thu hồi và cho thử lại.
- [ ] Thu hồi membership có hiệu lực ở request tiếp theo; RLS ngăn tự cấp quyền.
- [ ] Health trả đúng HTTP status, không lộ credential và không cache dữ liệu theo user.
- [ ] Migration đã chạy đúng môi trường, generated types đúng schema, preview không dùng DB production.
- [ ] DB có đủ 14 danh mục/130 bản ghi baseline, metadata và 3 MOCK_BEANS draft; manifest đối chiếu PASS. Import lặp không nhân bản/ghi đè chỉnh sửa; lỗi import rollback toàn transaction.
- [ ] Owner tạo/sửa/archive món và tạo/sửa danh mục ở `/admin/menu`; staff chỉ đổi còn bán; RLS/RPC ngăn vượt quyền kể cả gọi trực tiếp. Version conflict không ghi đè và audit ghi đúng actor cùng transaction.
- [ ] Preview DB chỉ hiện published, fallback VI và nhãn tạm hết đúng; UI thông báo thay đổi admin chưa xuất hiện trên website. Public vẫn giữ nguồn file và build không cần DB.
- [ ] Unit/component/integration/RLS checks và build pass; E2E ghi rõ “skipped theo yêu cầu”, không ghi pass.
- [ ] Có runbook, quyền sở hữu tài khoản thuộc chủ quán, biết cách cấp/thu hồi quyền và rollback.

Hoàn thành local code không tự đánh dấu checklist deployment pass. Khi toàn bộ gate cần thiết đã có bằng chứng, bước 1 mở rộng tùy chọn món/ảnh/cấu hình vận hành trên catalog có sẵn; bước 2 mới chuyển website sang dữ liệu DB đã công bố.

## Tài liệu tham khảo

- [Next.js Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers)
- [Vercel Functions](https://vercel.com/docs/functions/functions-api-reference)
- [Supabase Auth với Next.js](https://supabase.com/docs/guides/auth/quickstarts/nextjs)
- [Supabase server-side Auth](https://supabase.com/docs/guides/auth/server-side)
- [Supabase SSR: cache headers và session revocation](https://supabase.com/docs/guides/auth/server-side/advanced-guide)
- [Supabase PostgreSQL connections](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Supabase database functions: quyền EXECUTE và SECURITY DEFINER](https://supabase.com/docs/guides/database/functions)

Các API SDK và CLI cần được kiểm tra theo phiên bản cài lúc triển khai; không chép code cũ rồi bỏ qua hướng dẫn cookie/proxy của phiên bản hiện tại.
