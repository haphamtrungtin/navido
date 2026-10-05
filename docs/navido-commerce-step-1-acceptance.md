# NAVIDO Commerce — Bàn giao bước 1

Ngày kiểm tra: 2026-10-05. **Code đã implement, kiểm tra local và deploy staging Preview.** Authenticated HTTPS acceptance vẫn cần thực hiện; chưa đánh dấu production-ready.

## Đã implement

- [x] Public Menu, Home/signature và Roastery đọc category/món published từ DB, asynchronous/no-store; category mới có layout mặc định, EN/KO fallback VI. Không còn consumer public đọc repository file.
- [x] RPC public allowlist: không draft/mock, source metadata, membership hoặc audit. Anonymous không được SELECT bảng catalog.
- [x] Mô tả và nhóm tùy chọn ba ngôn ngữ, phụ phí VND nguyên, min/max/active constraints, owner CRUD qua mutation nguyên tử có version/audit. Nhóm inactive có thể chuẩn bị chưa hoàn chỉnh; nhóm active phải hợp lệ.
- [x] Chọn ảnh có sẵn từ allowlist và owner upload JPEG/PNG/WebP <=3 MiB, <=16 megapixel; normalize WebP <=1600px, bỏ metadata. Storage không overwrite; attach kiểm tra quyền/version, cleanup conflict không xóa ảnh đang được tham chiếu.
- [x] Form mô tả/ảnh chưa sửa rebase theo snapshot khớp; draft đã sửa hoặc file đã chọn giữ version cũ. Upload reset native input và giữ đúng ảnh upload hiện tại.
- [x] Cấu hình lịch 7 ngày, timezone `Asia/Ho_Chi_Minh`, prep 1–180 phút, giờ nhận cuối đủ thời gian chuẩn bị. Mặc định 7 ngày đóng, paused, prep đề xuất 20 phút. Staff chỉ pause qua RPC hẹp.
- [x] Harden Data API: description/options/image và settings chỉ được UPDATE qua RPC có expected version; không bypass bằng owner PATCH trực tiếp.
- [x] Build không cần credential DB; trạng thái unavailable/empty rõ ràng, ảnh lỗi giữ tên/giá; không fallback file cũ.

## Bằng chứng local và review

- 51 files / **215 unit/component tests**, 5 files / **15 integration tests**, 7 files / **87 pgTAP assertions**; lint, typecheck, production build và changed-file format/diff checks pass.
- Integration dùng Supabase Docker local gồm Auth/PostgREST/Storage; fixture ngẫu nhiên và cleanup, từ chối URL remote. Storage thật chứng minh owner upload/attach, không overwrite/delete ảnh đang dùng, staff/anonymous/foreign folder/revoked owner bị từ chối.
- Built application HTTP local: category/món mới từ DB hiển thị trên VI/EN/KO; owner mở item/settings; upload PNG được normalize/upload/attach thành version 2; revoked owner upload bị 403. Fixture và ảnh test đã cleanup.
- Review độc lập: không Critical; Important owner settings PATCH bypass đã được tái hiện rồi khóa bằng RPC-only writes. Hai vấn đề usability về version giữa sections và reset file input được nâng mức và sửa bằng regression tests. Root đã chạy lại gates sau fixes; reviewer không tự chạy suite. Không yêu cầu review lần hai.
- Smoke HTTP phát hiện NextURL normalize loopback gây Origin mismatch: kiểm tra theo Origin/Host thực tế, có regression local/alias và cross-origin rejection; HTTP upload thật pass sau sửa.
- _*E2E/Playwright và verify:* skipped theo yêu cầu_*, không được ghi pass.

## Staging

Target Supabase: `vuunlbhqkdgyvxkvzfnn`; Vercel project `navido-website`, team `kaikaiiiiis-projects`, Preview only, Functions `icn1`.

Trước rollout: 15 category/131 item hiện có (bao gồm sửa/thêm của owner), không ép DB khớp seed 14/130. Public app-data snapshot bị ignore: 141796 bytes, SHA256 `F35A581ABEECBDA93C10DC51EAB490FF7E4199865FD7A9BB2C8D16909EBFDB60`. Đây không phải backup Auth/Storage toàn project và chưa restore rehearsal. Bucket `menu-images` chưa tồn tại trước migration.

Đã apply migrations `20261005000400`–`20261005000800` sau snapshot/dry-run. Không rerun import hoặc overwrite bản ghi hiện có. Hashes category/item baseline trước/sau khớp nhau, giữ nguyên 15 category/131 item hiện có. Anonymous RPC staging trả 13 category/127 item public, không có metadata nội bộ; raw table read bị từ chối và settings mặc định paused.

Stable alias: [admin staging](https://navido-staging-vuunlbhqkdgyvxkvzfnn.vercel.app/admin/login). Deployment `dpl_2FDf7KvigpDC9EnjXu7bonoCtG3B` từ code commit `6dc8526`: READY, Preview, Functions `icn1`; URL riêng `https://navido-website-pyoq28i1x-kaikaiiiiis-projects.vercel.app`. Manifest deploy 482 files đã kiểm tra không chứa env/secret/private scratch. Giữ Vercel Authentication Preview; không promote production.

HTTPS smoke qua stable alias với Vercel CLI protection bypass: Menu VI/EN/KO, Home VI, Roastery VI và admin login 200; tên của toàn bộ 127 món published trong DB khớp HTML cả ba locale. Settings chưa đăng nhập 307 về login; health chưa đăng nhập 401, no-store/noindex. Đây là kiểm tra HTTP, không phải nghiệm thu thao tác owner/staff bằng browser.

## Còn cần nghiệm thu bằng phiên HTTPS thật

- [ ] Owner login/logout, menu/settings, reload và revoke trên staging; kế thừa checklist bước 0.
- [ ] Owner sửa category/tên/giá/thứ tự và tạo category/món mới; reload Menu cả ba locale và các consumer liên quan thấy đúng. Draft/archive/mock không lộ.
- [ ] Tạo nhóm bắt buộc/topping và phụ phí thực tế; kiểm tra invalid choices, shared version giữa basic/options/image và conflict hai tab; audit actor/version đúng.
- [ ] Chọn asset/upload từ browser thật, file sai/quá lớn, cùng file chọn lại, lỗi ảnh, conflict giữ ảnh cũ. Kiểm tra Storage thao tác staff/revoked bị chặn.
- [ ] Owner cấu hình lịch thực tế/prep/giờ nhận cuối; staff chỉ pause, không sửa lịch/content; owner PATCH aggregate trực tiếp bị chặn.

Không gửi password/cookie qua chat. Local fixtures/HTTP không thay thế các bước browser HTTPS này. Chưa mở checkout và chưa tạo tài khoản staff staging thay chủ quán.

## Quyết định trong triển khai

1. Public render động/no-store ở bước 1; snapshot rollback/cache thuộc bước 2. Chi phí nếu cần đổi: thêm cache có kiểm soát, hiện mỗi request đọc DB.
2. Cho phép nhóm inactive chưa hoàn chỉnh; chặn active group không đủ lựa chọn. Owner cần chủ động activate sau khi hoàn thiện.
3. Ảnh upload đã normalize/immutable dùng Image unoptimized; optimizer allowlist chỉ origin/path bucket cấu hình. Chi phí: chưa có responsive reencoding của Next cho upload.
4. Empty image selection được biểu diễn bằng chuỗi rỗng trong RPC client, DB normalize NULL; thêm migration 007 vì generated types không mô tả nullable SQL argument. Null SQL calls vẫn hợp lệ.
5. Giữ column-write API step 0 cho trường cơ bản; các aggregate mới chỉ ghi qua RPC. Chi phí: direct owner API trường cơ bản giữ cơ chế version-filter/trigger kế thừa, không thuộc đường ghi aggregate mới.

Snapshot rollback/cache chưa thực hiện là phạm vi step 2 đã duyệt. Không có minor review finding còn deferred sau khi sửa các vấn đề usability.

## Vận hành và rollback

Owner phải xác nhận tùy chọn và lịch thật trước khi dùng checkout bước 3; không tự suy luận size/nóng-lạnh/đường-đá hoặc gán Extras cho mọi món. Asset có sẵn để owner chọn, không tự mapping tên không chắc chắn.

Bucket public chỉ chứa ảnh dự định công khai; path khó đoán không phải quyền riêng tư. Không upload tài liệu nội bộ. Cleanup object mồ côi do owner bị revoke/response không rõ: quản trị viên đối chiếu `storage.objects` với `menu_items.image_path`, xóa qua Storage API sau khi xác nhận không còn tham chiếu; không DELETE metadata SQL để thay thao tác Storage API. Ảnh cũ chỉ được cleanup sau DB commit, không xóa trước attach.

Rollback ứng dụng bằng deployment trước, giữ schema/data/audit/Storage. Không reset/drop DB hoặc import lại file để rollback nội dung. Production cần DB/env riêng, backup/restore thực tế và authorization release riêng.

Tham khảo API đã đối chiếu: [Supabase Storage access control](https://supabase.com/docs/guides/storage/security/access-control), [Storage ownership](https://supabase.com/docs/guides/storage/security/ownership), [Sharp decode/pixel limits](https://sharp.pixelplumbing.com/api-constructor/), [Sharp resizing](https://sharp.pixelplumbing.com/api-resize/).
