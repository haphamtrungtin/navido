# NAVIDO Commerce — Infrastructure và vận hành bước 0

Phạm vi: Auth nhân viên, membership, catalog menu, import nguồn và admin. Public website vẫn đọc file. Staging/production chưa được provision hoặc deploy trong phiên implementation này; không coi kết quả local là bằng chứng production.

## Local

- Toolchain kiểm tra: Node 24.21.0, pnpm 10.34.5, Next 16.3.4.
- Supabase SDK 2.117.2, SSR 0.12.7 và CLI 2.119.0 được pin; PostgreSQL local 17.
- Cần Docker daemon. Local project ID `navido-website`; API `http://127.0.0.1:55321`, DB port `55322`. Windows trên máy triển khai giữ dải port mặc định 54321/54322, nên dùng dải 553xx.
- `db:start` chỉ chạy PostgreSQL, Auth, gateway và Data API; không cần Storage/Realtime/Studio cho automated gates. Không dừng/xóa container của project khác.

```powershell
corepack pnpm install --frozen-lockfile
corepack pnpm db:start
corepack pnpm exec supabase migration up --local
corepack pnpm db:types
corepack pnpm db:test
corepack pnpm test:integration
```

`db:stop` giữ backup volumes; không dùng `--no-backup`, `db reset` hoặc drop schema trên DB có dữ liệu. Không tự chạy reset để sửa migration.

Copy `.env.example` thành `.env.local`, thay `SUPABASE_URL` và `SUPABASE_PUBLISHABLE_KEY` bằng local API URL và publishable/anon key trong `supabase status`. Chỉ xem key trên máy riêng, không đưa vào log, screenshot, git hoặc chat. `NEXT_PUBLIC_SITE_URL` để trống tới khi domain production được xác minh. Build không đọc bắt buộc hai biến Supabase; chúng chỉ phục vụ runtime admin.

```powershell
corepack pnpm dev
```

Mở `/admin/login`; `/admin/menu` quản lý dữ liệu DB, `/admin/menu/categories` quản lý danh mục và `/admin/menu/preview?lang=vi` xem trước (`en`/`ko` cũng được). Website khách chưa nhận thay đổi trong admin; việc chuyển nguồn thuộc bước 2.

## Auth và bootstrap owner

Global signup và anonymous sign-in phải tắt. Provider email/password phải bật: ở CLI này `[auth].enable_signup=false` khóa đăng ký còn `[auth.email].enable_signup=true` giữ provider email hoạt động. Integration kiểm tra thật `signUp` trả `signup_disabled`. Không tạo membership bằng signup trigger.

Trong dashboard Supabase, tạo Auth user đã confirmed, thiết lập/chuyển password bằng kênh riêng, lấy UUID của user. Với local cần dashboard, dừng stack bằng `db:stop` rồi khởi động bằng `supabase start` không exclude Studio; Studio dùng port `55323` trong config. Đăng nhập dashboard bằng quyền quản trị, không thêm admin API hoặc service-role vào ứng dụng.

SQL Editor bằng quyền quản trị (thay UUID trước khi chạy):

```sql
insert into public.admin_memberships(user_id, role, is_active)
values ('REPLACE_WITH_CONFIRMED_AUTH_USER_UUID'::uuid, 'owner', true)
on conflict (user_id) do update set role = excluded.role, is_active = true;
```

Tạo staff theo cùng quy trình với role `staff`. Auth user có mật khẩu đúng vẫn không vào admin nếu thiếu membership/inactive. Logout scope `local` chỉ thu hồi phiên hiện tại; provider lỗi hiển thị trạng thái chưa xác nhận thu hồi, không báo thành công.

Thu hồi quyền ngay ở request kế tiếp:

```sql
update public.admin_memberships
set is_active = false
where user_id = 'REPLACE_WITH_AUTH_USER_UUID'::uuid;
```

Recovery mật khẩu qua dashboard/công cụ quản trị của chủ quán. Không mở public signup để sửa tài khoản. Xóa Auth user làm membership cascade; audit giữ bản ghi, actor có thể null sau khi user bị xóa.

Local rate limit trong config: login/signup 30 requests/5 phút/IP, refresh 150/5 phút/IP. Đọc và ghi lại giá trị thực tế trong dashboard remote trước staging/production; không giả định config local tự được apply lên cloud. Không dùng limiter in-memory trên Vercel.

## Schema, import và quyền menu

Thứ tự migration:

1. `20261005000100_admin_memberships.sql`: membership, grant và RLS.
2. `20261005000200_menu_catalog.sql`: danh mục/món, RLS, availability RPC, version và audit.
3. `20261005000300_import_initial_menu.sql`: snapshot nguồn, 14 danh mục/130 bản ghi, 127 published/3 mock draft.

`menu.json` không đổi. Nguồn seed là normalized menu đã đối chiếu với raw; manifest tại `docs/menu-db-import-manifest.json` chứa checksum và toàn bộ trường cần đối chiếu. `menu:import:generate` chỉ sinh SQL, không kết nối/apply DB. Không sửa migration đã deploy khi nguồn thay đổi; tạo quy trình import mới sau review. SQL string được escape và transaction rollback toàn bộ khi lỗi. Rerun dùng `ON CONFLICT (id) DO NOTHING`: không nhân bản, không ghi đè sửa tên/giá/chuyển danh mục.

Owner quản lý nội dung/giá/danh mục/công bố/review; staff đọc và chỉ đổi availability qua RPC. RLS và function kiểm tra membership active, kể cả gọi trực tiếp Data API. Không cấp quyền DELETE catalog hoặc quyền user ghi audit. Món ngừng dùng chuyển `archived`. Audit ghi actor/timestamp/before/after cùng transaction; version integer tăng ở DB. Khi conflict, tải lại trước khi sửa tiếp.

Metadata nguồn là chỉ đọc. Cờ cần review có thể được owner bỏ sau rà soát; review notes nguồn vẫn giữ. Các bản ghi Extras và nghi trùng được giữ đủ để review; cấu hình tùy chọn/checkout không thuộc bước 0. Món mock giữ draft khi import; owner chịu trách nhiệm review trước công bố nội dung mới.

## Môi trường remote và deploy

### Hướng dẫn bắt đầu khi chưa có tài khoản

1. Đăng nhập [Supabase Dashboard](https://supabase.com/dashboard) bằng tài khoản chủ quán. Tạo organization và project `navido-staging`; kiểm tra vùng Singapore, gói/chi phí đang hiển thị trước khi xác nhận. Lưu database password trong password manager riêng. Giữ Data API hoạt động cho schema `public`; ứng dụng đã bảo vệ bảng bằng RLS. Xem [quickstart chính thức](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs).
2. Lấy project URL từ Connect và publishable key từ Settings → API Keys, theo [tài liệu API keys](https://supabase.com/docs/guides/getting-started/api-keys). App này dùng tên `SUPABASE_URL` và `SUPABASE_PUBLISHABLE_KEY` chỉ ở server. Không dùng secret/service-role key cho env runtime.
3. Trong Authentication, bật email/password, tắt cho phép đăng ký mới và anonymous sign-in. Tạo owner confirmed rồi dùng SQL membership ở mục bootstrap sau khi apply migrations. Kiểm tra rate limits thực tế và ghi lại cấu hình cloud.
4. Đăng nhập Vercel bằng tài khoản có quyền project NAVIDO đã link. Vào Project Settings → Environment Variables, thêm hai biến Supabase với scope **Preview** và giá trị của staging. Scope Production để riêng. Thay đổi env cần deployment mới để có hiệu lực; xem [hướng dẫn Vercel](https://vercel.com/docs/environment-variables).
5. Sau khi tạo xong, chỉ cung cấp project ref staging và tên team/project Vercel để tiếp tục. Key/password đặt tại dashboard hoặc máy riêng, không gửi vào chat. Phần migration/apply/Preview tiếp tục theo các lệnh bên dưới khi quyền truy cập đã sẵn sàng.
6. Sau nghiệm thu staging, tạo project `navido-production` riêng, xác nhận backup/chi phí, cấu hình env scope Production và bootstrap owner production. Chỉ deploy production khi chủ quán cho phép.

Đầu vào còn thiếu để kết thúc staging: Supabase project staging thuộc tài khoản chủ quán, quyền apply migration, quyền Vercel project hiện có và quyết định vùng/plan. Production cần Supabase project riêng và cho phép deploy production. Không mua gói hoặc dùng DB production cho preview/tests.

| Môi trường        | Supabase                              | Vercel env                                            |
| ----------------- | ------------------------------------- | ----------------------------------------------------- |
| Local/integration | CLI + Docker project `navido-website` | Local only                                            |
| Preview           | Project staging riêng                 | Preview `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`    |
| Production        | Project production riêng              | Production `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` |

Kiểm tra vùng Singapore gần nhau và chi phí/khả năng gói tại lúc provision; ghi project ref, vùng, chủ sở hữu và env scope thực tế, không ghi key. Vercel project hiện có trong `.vercel/project.json`; không tự tạo project Vercel khác.

Trước apply mỗi remote: xác minh project ref và target env, kiểm tra pending migrations, backup theo gói thực tế nếu DB đã có dữ liệu. CLI credential chỉ ở máy quản trị/CI được bảo vệ, không có service-role/secret key tại runtime Vercel.

```powershell
# Thay ref staging thực tế và kiểm tra link trước khi dùng --linked.
corepack pnpm exec supabase link --project-ref REPLACE_WITH_STAGING_PROJECT_REF
corepack pnpm exec supabase migration list --linked
corepack pnpm exec supabase db push --linked --dry-run
# Chỉ apply sau khi pending list/project ref đã được xác minh:
corepack pnpm exec supabase db push --linked
```

Sau đó cấu hình Auth cloud, env Preview, deploy Preview qua Vercel project hiện có, bootstrap owner staging và nghiệm thu HTTPS. Khi production được cho phép, làm lại target/ref/env/backup checks với project production; không tái sử dụng link staging mà không kiểm tra. Ghi khả năng backup/restore và hạn mức theo tài khoản thực tế trước release.

Rollback: trở về deployment trước; giữ membership/catalog/audit và snapshot import. Không drop table/reset DB. Nếu cần phục hồi menu đã chỉnh sửa, chủ quán review dữ liệu audit/backup rồi thực hiện thay đổi có kiểm soát; không tự import file cũ để overwrite.

## Verification và bằng chứng

Gate bắt buộc: lint, typecheck, unit/component suite, integration local, DB pgTAP/RLS và build. Integration tự đọc credential CLI local trong memory, từ chối URL remote và port khác; fixture user/password ngẫu nhiên và được cleanup. Không đưa service key của test vào app env.

```powershell
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm test:integration
corepack pnpm db:test
corepack pnpm build
```

Nếu thiếu Docker, máy khác/CI chạy cùng commit/CLI và bàn giao types/kết quả. Smoke staging không thay DB gates. Playwright/E2E và `verify:*` **skipped theo yêu cầu**, không được ghi pass. Format chỉ file thay đổi.

Local đã kiểm tra ngày 2026-10-05 trên branch `feature/navido-website`: 40 files/156 unit và component tests, 3 files/9 integration tests, 2 files/35 pgTAP assertions; lint, typecheck và production build không có Supabase env. Review độc lập không phát hiện Critical; lỗi draft/version sau refresh đã tái hiện bằng hai regression tests rồi sửa để giữ version gắn với draft.

HTTP smoke với `next start` và Supabase local: `/vi/menu`, `/en/menu`, `/ko/menu`, login và các trang admin trả đúng; anonymous health 401, owner health 200, thu hồi membership health 403; health không cache. Fixture đã cleanup. Đây là kiểm tra HTTP local, chưa xác minh browser form hoặc deployment HTTPS. Preview dùng tham số `lang=vi|en|ko`. Staging/production vẫn chưa có bằng chứng deploy. Commit chứa runbook này là mốc implementation để chạy lại các gate.
