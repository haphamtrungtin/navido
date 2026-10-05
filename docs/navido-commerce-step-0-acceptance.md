# NAVIDO Commerce — Bàn giao bước 0

Ngày kiểm tra: 2026-10-05. Code mới nhất: `1d7fa6e`. Staging đã deploy; bước 0 chưa được đánh dấu nghiệm thu toàn bộ vì còn kiểm tra phiên đăng nhập HTTPS thật.

## Đã hoàn thành và kiểm tra

- [x] Foundation, env server, Supabase Auth, membership, RLS, admin guard, login/logout và private health.
- [x] Import menu hiện có: 14 danh mục, 130 món, 127 published/3 draft; staging đối chiếu mọi trường với manifest.
- [x] Admin danh mục/món, archive, staff availability, DB preview, audit và version conflict. Public website vẫn đọc file theo phạm vi đã chốt.
- [x] Category form lưu liên tiếp giữ đúng version; giữ toàn bộ draft khi có thay đổi đồng thời; khóa input khi đang lưu.
- [x] 163 unit/component tests, 9 integration tests và 51 pgTAP assertions; lint, typecheck, build pass trên code mới nhất. Integration chạy Supabase local; E2E/Playwright skipped theo yêu cầu.
- [x] Review độc lập bản sửa không có finding.
- [x] Supabase staging riêng `vuunlbhqkdgyvxkvzfnn`: 3 migration đã apply, signup/anonymous tắt, email provider bật; owner active đã bootstrap và kiểm tra RLS.
- [x] Vercel Preview READY, env chỉ Preview, `vercel.json` cố định Functions `icn1`. Không thay đổi production.
- [x] Upload loại env/credentials/scratch bằng `.vercelignore`; logical snapshot public data lưu riêng ngoài git.

## Còn cần nghiệm thu staging

URL: [đăng nhập admin staging](https://navido-staging-vuunlbhqkdgyvxkvzfnn.vercel.app/admin/login). Vercel Authentication vẫn bật; đăng nhập Vercel trước nếu được yêu cầu, sau đó dùng tài khoản owner Supabase của chủ quán. Không gửi password/cookie qua chat.

- [ ] Owner đăng nhập, reload, mở menu và private health thành công trên HTTPS; logout khiến request tiếp theo bị từ chối.
- [ ] Owner tạo/sửa danh mục và món thử, lưu danh mục liên tiếp, archive món; DB preview hiển thị đúng. Dùng bản ghi thử riêng để giữ nội dung menu đã import.
- [ ] Hai tab sửa cùng bản ghi: tab cũ báo conflict và không ghi đè. Audit ghi đúng actor/version.
- [ ] Staff riêng chỉ đổi availability; không sửa giá/tên/danh mục. Thu hồi membership của tài khoản thử có hiệu lực ở request tiếp theo.

Các hành vi này đã có bằng chứng local/integration; bootstrap owner và mô phỏng authenticated DB context không thay thế phiên HTTPS thật. Trình duyệt kết nối không khả dụng trong phiên kiểm tra này, nên không đánh dấu pass thay người dùng.

## Production

Chưa provision/deploy production. Trước release cần project Supabase production riêng, env Production, xác nhận gói/backup/restore và quyền triển khai. Snapshot public data staging không gồm Auth và chưa được diễn tập restore. Không promote Preview dùng staging env sang production.

Chi tiết vận hành và bằng chứng: [runbook](navido-commerce-infrastructure.md).
