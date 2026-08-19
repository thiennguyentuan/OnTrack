# Kết quả chạy test toàn bộ use case — 18/08/2026

## Môi trường

- PostgreSQL Docker: running.
- FastAPI: `GET /health` = `{ "status": "ok", "database": "postgresql" }`.
- Expo web: `http://127.0.0.1:8081` trả HTTP 200.

## REST E2E

Đã tạo tài khoản test riêng, chạy và cleanup dữ liệu. **30/30 PASS**:

1. Register, login, profile read/update, logout.
2. Deadline list/create/read/update/risk/delete.
3. Milestone create/update/delete.
4. Task create/read/update/delete.
5. Session create/read/reschedule/start/pause/resume/end/review/follow-up/history/cancel.
6. Today dashboard.

## Web E2E

- PASS: Today, Plans, Me, Account, History, Focus Settings, Notification Settings, Create Deadline, logout và legacy route fallback/redirect.
- PASS: Account cập nhật `full_name` và `timezone` qua REST; tải lại Me vẫn hiển thị tên mới.
- PASS: History gọi API và hiển thị empty state thật khi không có phiên hoàn thành.
- PASS: UC-05 Forgot Password dùng Mailpit local. Email reset được gửi qua SMTP, link mở Reset Password, đổi password thành công và UI login lại bằng password mới. Token dùng lại bị API chặn HTTP 400.

## Automated gates

- `pnpm run typecheck`: PASS.
- `pnpm test`: 10 files pass, 12 assertions pass; 5 files/10 assertions Supabase legacy skip.
- `pnpm exec expo export --platform web --output-dir .expo-export-test`: PASS.

## Kết luận

38/38 use case trong ma trận đã có kết quả PASS/coverage hợp lệ ở môi trường local. Production cần thay Mailpit bằng SMTP provider thật trong `backend/.env`.
