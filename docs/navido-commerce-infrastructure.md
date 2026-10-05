# NAVIDO Commerce — Infrastructure và vận hành bước 0

Phạm vi: Auth nhân viên, membership, catalog menu, import nguồn và admin. Public website vẫn đọc file. Staging đã apply schema/import, cấu hình Auth và deploy Preview ngày 2026-10-05; owner đã được cấp active và kiểm tra RLS; nghiệm thu authenticated HTTPS còn pending. Production chưa provision/deploy.

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

Đã xác minh quyền CLI Supabase/Vercel và project staging bên dưới. Đầu vào còn thiếu để kết thúc staging: nghiệm thu authenticated HTTPS bằng owner đã cấp quyền. Production cần Supabase project riêng và cho phép deploy production. Không mua gói hoặc dùng DB production cho preview/tests.

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

### Bằng chứng staging 2026-10-05

| Hạng mục    | Kết quả                                                                                                                                                                                                                                 |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Supabase    | `navido-staging`, ref `vuunlbhqkdgyvxkvzfnn`, organization `xvcwjfekkqmecmtvfxah`, status `ACTIVE_HEALTHY`, PostgreSQL 17                                                                                                               |
| Region      | Supabase `ap-northeast-2` (Seoul); Vercel Functions `icn1` theo deployment inspect. Build machine vẫn ở `iad1`; đây là region build, không phải runtime Functions                                                                       |
| Vercel      | `kaikaiiiiis-projects/navido-website`, ID `prj_xK5fyDf8TfyD8qAr5rd9bCbh6G0o`; CLI 62.2.0 xác minh quyền                                                                                                                                 |
| Migrations  | List và dry-run trước apply; public schema chưa có bảng ứng dụng, schema snapshot lưu riêng ở ignored scratch; cả 3 migration đã apply và remote history khớp local                                                                     |
| Catalog     | Read-only query so sánh tất cả trường trong manifest: 14 danh mục, 130 món, 127 published/3 draft; đủ 4 bảng bật RLS                                                                                                                    |
| Auth        | Config diff trước push chỉ đổi `auth.enable_signup` thành false; các property không khai báo giữ nguyên. Settings API xác nhận signup disabled, email enabled, anonymous disabled. Rate config 30 login/signup, 150 refresh khớp remote |
| Env         | `SUPABASE_URL` và publishable key chỉ scope Preview. Project chưa connect Git repository nên không dùng env theo branch; không thêm env Production. Key không ghi vào git/log                                                           |
| Upload      | Dry-run CLI ban đầu vẫn lấy scratch/local state dù git ignore. `.vercelignore` ở commit `2907b1e` loại env, credentials, scratch, worktree/junction và Supabase temp; manifest cuối 439 files đã kiểm tra trước upload                  |
| Deployment  | `dpl_4BdWKEVNAVEghrVW3JhLC3WJ7725`, source commit `1d7fa6e`, target Preview, status READY                                                                                                                                               |
| HTTPS smoke | Qua `vercel curl` tự bypass lớp bảo vệ Vercel: login 200, menu VI/EN/KO 200, anonymous health 401 JSON `unauthenticated`, `Cache-Control: no-store`, `X-Robots-Tag: noindex, nofollow`                                                  |
| Còn pending | Authenticated HTTPS CRUD/logout/revoke và quyền truy cập staff; production/account plan/backup-restore chưa nghiệm thu                                                                                                                  |

Preview: [admin login](https://navido-staging-vuunlbhqkdgyvxkvzfnn.vercel.app/admin/login). Vercel Authentication đang bảo vệ Preview; phải đăng nhập Vercel trước lớp login của ứng dụng. Không tắt lớp bảo vệ này để chạy smoke. Không promote Preview lên Production: deployment đang dùng staging env.

Owner staging đã được bootstrap từ UUID do chủ quán cung cấp: Auth user confirmed, không bị ban/xóa, membership `owner` và `is_active=true`. Upsert có precondition và transaction; read-back đã xác minh. Kiểm tra RLS trong authenticated context của user này đọc được 14 danh mục/130 món và audit. Đây là bằng chứng quyền DB, không thay thế phiên đăng nhập HTTPS thật. Không ghi email/password vào tài liệu; chủ quán giữ password riêng và đăng nhập Preview để nghiệm thu.

`vercel.json` lưu `regions: ["icn1"]` để giữ Functions gần DB. Deployment `1d7fa6e` không truyền region qua CLI và inspect vẫn xác nhận `icn1`. Alias staging riêng trỏ tới Preview này; các alias production giữ nguyên. Cấu hình theo [tài liệu Vercel Functions regions](https://vercel.com/docs/functions/configuring-functions/region); [icn1 là Seoul](https://vercel.com/docs/pricing/regional-pricing/icn1).

```powershell
corepack pnpm dlx vercel@62.2.0 deploy --target preview --scope kaikaiiiiis-projects --yes
```

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

Local đã kiểm tra ngày 2026-10-05 trên branch `feature/navido-website`: 41 files/163 unit và component tests, 3 files/9 integration tests, 3 files/51 pgTAP assertions; lint, typecheck và production build không có Supabase env. Implementation gốc ở commit `86a5989`. Review độc lập không phát hiện Critical; lỗi draft/version sau refresh đã tái hiện bằng hai regression tests rồi sửa để giữ version gắn với draft. Bổ sung test giao diện staff/bộ lọc và DB checks chống giả nguồn/version/actor/audit, không membership, inactive owner và sửa danh mục bằng staff.

HTTP smoke với `next start` và Supabase local: `/vi/menu`, `/en/menu`, `/ko/menu`, login và các trang admin trả đúng; anonymous health 401, owner health 200, thu hồi membership health 403; health không cache. Bổ sung POST form HTML thực tế tới Server Actions: login tạo cookie và redirect, tạo danh mục/món, archive, form version cũ báo conflict và giữ dữ liệu, staff gửi lại form owner không sửa được giá, staff đổi availability tăng version, logout xóa quyền truy cập health. Fixture đã cleanup. Không dùng browser/Playwright/E2E runner; tương tác browser và authenticated HTTPS vẫn cần nghiệm thu staging. Preview dùng tham số `lang=vi|en|ko`. Bằng chứng deploy staging và anonymous HTTPS ở mục trên; production chưa deploy.

Setup cloud cần thao tác đăng nhập/tạo project của chủ quán. Lần kiểm tra file credential ban đầu không đủ để kết luận quyền; sau khi chủ quán login Supabase, `projects list` và `vercel whoami/project inspect` đã xác minh quyền thực tế. Trong phiên này có wizard một lần tại `.superpowers/sdd/2026-10-05-navido-commerce-step-0/setup-staging.sh` (không commit), dùng cho giai đoạn chuẩn bị tài khoản/env, chạy bằng Git Bash từ PowerShell:

```powershell
& 'C:/Program Files/Git/bin/bash.exe' .superpowers/sdd/2026-10-05-navido-commerce-step-0/setup-staging.sh
```

Wizard mở dashboard, hướng dẫn 5 bước tài khoản/Auth/env/CLI/Vercel Preview, nhập key ẩn và lưu `.env.staging.local` bị git ignore. Đã kiểm tra `bash -n`, tính nguyên vẹn template và review độc lập; chưa chạy tương tác thay chủ quán. Không apply migration/deploy và không thu thập database password hoặc service-role key. Máy khác dùng hướng dẫn dashboard ở trên. Sau khi hoàn tất, cung cấp project ref staging và team/project Vercel, giữ key/password riêng trên máy/dashboard.

## Bàn giao mới nhất

Xem [checklist bước 0](navido-commerce-step-0-acceptance.md) để phân biệt phần đã kiểm tra với nghiệm thu HTTPS còn thiếu. Category form đã kiểm tra lưu liên tiếp: chỉ cập nhật expectedVersion khi toàn bộ tên và sort order khớp snapshot server; draft xung đột giữ version cũ, input khóa khi pending. Review độc lập không có finding trên bản sửa.

Backup staging: CLI chưa liệt kê bản physical backup khả dụng và PITR đang tắt tại thời điểm kiểm tra. Đã xuất snapshot logical của schema public (data-only) vào scratch bị ignore ngày 2026-10-05; snapshot này không gồm Auth và chưa được restore rehearsal, không thay thế backup toàn project. Trước production cần xác nhận backup/restore và gói thực tế.
