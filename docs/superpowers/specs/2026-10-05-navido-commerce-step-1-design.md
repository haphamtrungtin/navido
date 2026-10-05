# NAVIDO Commerce — Step 1: catalog đầy đủ và website đọc DB

**Ngày:** 2026-10-05  
**Trạng thái:** Thiết kế để review; chưa implement.  
**Căn cứ:** [Roadmap commerce](../plans/2026-10-05-navido-commerce-overall.md), code step 0 tại `1d7fa6e`, và yêu cầu mới: chuyển **cả category và món public sang DB trong step 1**.

## 1. Kết quả cần đạt

Owner quản lý danh mục, món, tùy chọn, ảnh và giờ nhận đơn trong admin. Website Menu, Home/signature và Roastery cùng đọc dữ liệu đã công bố từ DB; chỉnh tên, giá, danh mục hoặc thứ tự không cần deploy lại. Category mới sử dụng layout mặc định hiện có.

Đây là mở rộng kiến trúc catalog hiện có. Không tạo lại catalog, không import lại để ghi đè dữ liệu staging đã sửa. Step 0 còn nghiệm thu owner/staff qua HTTPS thực tế; giữ mục này trong checklist release, không coi việc bắt đầu step 1 là đã nghiệm thu step 0.

Phần chuyển nguồn menu vốn thuộc step 2 được đưa lên step 1 theo quyết định mới. Step 2 sau đó tập trung vào snapshot công bố, rollback nội dung và tối ưu cache; không thực hiện lại việc chuyển nguồn.

## 2. Website và ranh giới đọc public

### Cách tiếp cận được chọn

Đọc phía server qua RPC `get_published_menu()` trả một JSON snapshot nhất quán trong một statement, gồm category và món được phép hiển thị. Dùng publishable key, không dùng service role, không gắn session admin vào public client. RPC `security definer`, `search_path` rỗng, tên bảng đầy đủ và payload allowlist; chỉ cấp quyền execute cho `anon`/`authenticated`.

Không cấp SELECT public trên bảng catalog hiện có. Payload public không chứa membership, actor, audit, source row/name/code, review notes hoặc bản nháp. Item chỉ xuất hiện khi `publication_status = 'published'`; `MOCK_BEANS` luôn bị loại, kể cả nếu bị đổi nhầm sang published. Category chỉ xuất hiện khi có item public. Món tạm hết vẫn hiển thị với nhãn ba ngôn ngữ; chưa có checkout ở bước này.

Hai phương án khác không chọn: cấp SELECT bảng với RLS public dễ làm lộ metadata nội bộ; ghép category DB với món từ file gây lệch dữ liệu khi owner đổi category hoặc thêm món.

### Repository và consumer

- Thêm `getPublishedMenu(): Promise<PublishedMenu>` trong `src/features/menu/repository/published-menu-repository.ts`, server-only. Validation runtime kiểm tra payload, giá VND nguyên không âm, ID duy nhất và liên kết category/item.
- Public item dùng ID làm định danh; metadata import trở thành optional/internal, không giả tạo source row cho món mới. Roastery deduplicate theo item ID và dùng reference ID để chọn món nổi bật; các reference không còn public được bỏ qua.
- Menu, Home và Roastery chuyển sang render động. Build không gọi DB và không cần credential; runtime có cấu hình DB hợp lệ mới đọc được menu.
- Request tới DB dùng `no-store`; React request memoization chỉ chia sẻ snapshot trong cùng render. Không cache xuyên user hoặc deployment ở step 1. Request mới sau khi lưu thấy thay đổi ngay; trang đã mở cần reload/navigation, chưa có realtime push.
- EN/KO trống fallback VI. Category mới dùng `typography` và không bắt buộc ảnh editorial. Giữ thiết kế category cũ bằng presentation map; map chỉ điều khiển layout, không điều khiển danh sách/tên/thứ tự category.
- Khi DB lỗi, vùng menu hiển thị thông báo bản địa hóa và thử lại; không âm thầm dùng file gốc. Home/Roastery vẫn hiển thị nội dung giới thiệu, vùng sản phẩm thông báo tạm không tải được. Menu rỗng có trạng thái riêng với lỗi DB.
- Repository file và generated JSON giữ làm nguồn import lịch sử/test đối chiếu, không còn consumer runtime public.

## 3. Nội dung món và tùy chọn

Thêm mô tả `description_vi/en/ko`, ảnh và nhóm tùy chọn vào item. Owner sửa nội dung/giá; staff chỉ xem và thao tác vận hành đã được phép. EN/KO thiếu được fallback VI và đánh dấu review trong admin, không tự tạo bản dịch.

Nhóm tùy chọn thuộc một món, gồm ID ổn định, tên ba ngôn ngữ, thứ tự, `minSelections`, `maxSelections`, trạng thái active và các lựa chọn. Lựa chọn gồm ID, tên ba ngôn ngữ, phụ phí VND nguyên không âm, thứ tự và trạng thái active. Nhóm bắt buộc có min > 0; nhóm thêm có min = 0. Quy tắc: `0 <= min <= max <= số lựa chọn active`, max ít nhất 1. Mỗi lựa chọn được chọn tối đa một lần; chưa có quantity riêng cho topping.

Lưu toàn bộ nhóm/lựa chọn của một item trong transaction với expected item version; kiểm tra membership owner, FK/ID, kích thước và giới hạn tại DB. Tối đa 10 nhóm/món, 20 lựa chọn/nhóm; không tự gán size/nóng-lạnh/đường-đá dựa vào tên món. Admin cho phép owner thiết lập các nhóm này sau khi xác nhận menu thực tế.

Các record Extras nguồn tiếp tục được giữ trong DB và menu đối chiếu. Không tự liên kết Extras vào tất cả món và không đổi chúng thành topping đã được quán xác nhận. Owner có thể tạo lựa chọn tương ứng với giá thực tế. Việc chọn và tính giá checkout thuộc step 3; step 1 cung cấp dữ liệu và validation cho bước đó.

Public snapshot trả nhóm/lựa chọn active của item published. Không trả nhóm inactive. Nếu nhóm bắt buộc thiếu lựa chọn hợp lệ, chặn công bố/lưu cấu hình gây sai thay vì phát hành cấu hình không thể chọn.

## 4. Ảnh

Giữ các asset có sẵn trong `public/images/navido/menu/`. Owner có thể chọn asset từ danh sách allowlist hoặc upload ảnh mới; không tự ghi mapping dựa trên so khớp tên có độ chắc chắn thấp. Ảnh không bắt buộc để công bố món.

Upload vào Supabase Storage bucket `menu-images`; không ghi filesystem Vercel. Chỉ owner active được upload và gắn ảnh vào món; staff bị từ chối cả tại action và Storage policy. Bucket public chỉ chứa ảnh dự định công khai, không chứa tài liệu nội bộ.

Giới hạn file đầu vào 3 MiB, JPEG/PNG/WebP; không SVG/GIF. Kiểm tra bytes và decode thực tế, không tin MIME/extension. Giới hạn 16 megapixel và resize cạnh dài tối đa 1600 pixel, xuất WebP để bỏ metadata. Object key do server sinh, không nhận đường dẫn ghi từ client và không overwrite object cũ.

Upload dùng route handler có kiểm tra same-origin, Auth/membership và giới hạn body trước decode. Gắn image path bằng mutation owner với expected item version và audit. Upload thành công nhưng gắn thất bại do conflict: xóa object vừa tạo theo khả năng, trả conflict và giữ ảnh cũ. Không xóa ảnh cũ trước khi DB commit. Không mở endpoint xóa object tùy ý; cleanup object mồ côi và ảnh không còn tham chiếu là thao tác vận hành được ghi trong runbook.

Đường dẫn ảnh lưu trong DB là asset allowlist hoặc object key trong bucket, không URL arbitrary. Public renderer dựng URL từ Supabase URL đã cấu hình; ảnh lỗi có fallback, tên và giá vẫn đọc được. Next Image remotePatterns chỉ cho origin/path bucket đang cấu hình.

## 5. Giờ nhận đơn và chuẩn bị

Thêm cấu hình singleton `store_order_settings`, timezone cố định `Asia/Ho_Chi_Minh`, giờ theo tuần 7 ngày, thời gian chuẩn bị và cờ tạm dừng nhận đơn. Mỗi ngày có bật/tắt, giờ phục vụ bắt đầu/kết thúc và giờ nhận đơn cuối. Bản đầu không hỗ trợ khoảng qua nửa đêm hoặc nhiều ca/ngày.

Ngày mở hợp lệ khi `start < lastOrder <= end`; giờ nhận đơn cuối cộng thời gian chuẩn bị không vượt giờ kết thúc phục vụ. Thời gian chuẩn bị là số nguyên 1–180 phút. Các ngày đóng không nhận đơn. Không mặc định lấy giờ đóng cửa trên website làm giờ nhận đơn cuối.

Seed an toàn: tạm dừng nhận đơn, cả 7 ngày đóng và thời gian chuẩn bị đề xuất 20 phút. Owner phải điền lịch thực tế và chủ động bật nhận đơn; chưa có checkout, nên cấu hình chưa tạo đơn hay thay đổi giờ mở cửa hiển thị trong Footer/Location.

Owner sửa lịch/thời gian chuẩn bị; owner/staff được bật/tắt tạm dừng qua RPC hẹp có expected version. Staff không sửa lịch hoặc thời gian chuẩn bị. Mọi mutation có audit và kiểm tra membership mới, kể cả quyền vừa bị thu hồi. Public trả cấu hình cần cho bước checkout tương lai, không trả actor/audit.

## 6. Migration, audit và triển khai

Migration additive sau ba migration step 0, có constraints/RLS/grants tường minh; không reset hoặc drop bảng. Reuse item version và audit để thay đổi mô tả/ảnh/tùy chọn được theo dõi nguyên tử. Bổ sung loại audit cho cấu hình vận hành, không phá sự kiện lịch sử.

Lưu nhóm lựa chọn và cấu hình kiểm tra version tại DB, không chỉ ở UI. Conflict giữ bản nháp để người dùng tải lại/đối chiếu. Áp dụng cách rebase version đã sửa ở CategoryForm cho form mới; không tự tăng version cho một draft chưa được lưu khớp toàn bộ.

Migration local và tests pass trước khi apply staging. Trước staging push, kiểm tra project ref, migration dry-run và snapshot app data. Triển khai Preview và chuyển stable staging alias sau khi build thành công. Production vẫn là lần release riêng với DB riêng và authorization tương ứng.

Rollback ứng dụng không xóa dữ liệu. Nếu public DB gặp sự cố, hiển thị lỗi rõ và có thể rollback deployment về bản trước theo quyết định vận hành; không fallback dữ liệu cũ bên trong request. Snapshot nội dung/rollback trong admin được thực hiện ở step 2.

## 7. Kiểm tra và tiêu chí nghiệm thu

Không viết/chạy E2E, Playwright hoặc `verify:*` theo quyết định hiện có.

- Unit/component: mapping/fallback ngôn ngữ, category mới và thứ tự DB, item mới không source row, unavailable/empty, draft/mock không lọt vào snapshot, reference featured đã ẩn, form giữ draft khi conflict.
- Tùy chọn: min/max, nhóm bắt buộc, active count, giá âm/phân số/overflow, ID trùng, giới hạn payload và rollback toàn transaction khi một lựa chọn sai.
- Ảnh: giả MIME, bytes lỗi, quá dung lượng/pixel, path ngoài allowlist, staff/revoked owner bị từ chối, cleanup sau conflict và fallback renderer.
- Cấu hình: ngày đóng, lastOrder/prepare/end, 7 ngày duy nhất, timezone cố định, staff chỉ pause và concurrent version conflict.
- Local integration/pgTAP: anonymous chỉ execute projection public; không đọc bảng/audit/membership; owner mutations, staff RPC hẹp, revoked membership, version/audit và Storage policies thật.
- Gates: lint, typecheck, toàn bộ unit/component, integration, DB tests, build không credential, format file thay đổi và diff check.
- Staging HTTPS: đổi category/tên/giá trên owner admin thấy ở VI/EN/KO Menu và Home/Roastery khi dùng reference; category mới có layout; draft/mock không lộ; lỗi đọc không fallback file; upload, tùy chọn, lịch, staff/revoke/conflict/logout được ghi kết quả. Trường hợp chưa có browser/session thực tế giữ trạng thái pending.

**Hoàn tất code** và **nghiệm thu staging** được báo riêng. Không đánh dấu milestone ship hoặc production-ready chỉ dựa trên tests local.
