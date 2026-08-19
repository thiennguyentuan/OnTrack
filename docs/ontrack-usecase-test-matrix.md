# OnTrack — Use case & test matrix

Ngày kiểm kê: 18/08/2026  
Phạm vi: Expo FE, FastAPI REST v3 và các test hiện có trong `tests/`.

## Quy ước coverage

- **AUTO**: Có test tự động đang chạy trong `pnpm test`.
- **E2E/MANUAL**: Đã được xác minh trên web local hoặc REST smoke flow; chưa phải browser test tự động có thể lặp lại.
- **PARTIAL**: Chỉ test mapper/state phụ trợ, không test toàn bộ API/UI flow.
- **MISSING**: Chưa có test phù hợp cho REST v3 hiện tại.
- Nhóm `tests/integration/*` dùng Supabase/RPC cũ; không có `SUPABASE_ANON_KEY` nên 10 test đang **skip**, và **không được tính** là coverage của FastAPI/PostgreSQL REST.

## A. Hệ thống và xác thực

| ID | Use case | Actor | API / màn hình | Test hiện có | Coverage |
|---|---|---|---|---|---|
| UC-01 | Kiểm tra tình trạng hệ thống | Client/Ops | `GET /health` | REST smoke trả `status=ok`, `database=postgresql` | E2E/MANUAL |
| UC-02 | Đăng ký tài khoản | Người dùng mới | `POST /auth/register`, Register | E2E web: tạo user và chuyển Today | E2E/MANUAL |
| UC-03 | Đăng nhập | Người dùng | `POST /auth/login`, Login | REST smoke trước đó; chưa có test REST tự động | E2E/MANUAL |
| UC-04 | Đăng xuất và xoá session local | Người dùng | `POST /auth/logout`, Me | `tests/domain/logout.test.ts` | AUTO |
| UC-05 | Quên mật khẩu | Người dùng | `POST /auth/forgot-password`, `POST /auth/reset-password`, `/(auth)/forgot-password`, `/(auth)/reset-password` | Mailpit E2E: email reset thật → link → đổi mật khẩu → login lại; token SHA-256 một lần, hạn 30 phút và bị chặn khi dùng lại. | **PASS** |
| UC-06 | Xem hồ sơ hiện tại | Người dùng đã đăng nhập | `GET /users/me`, Me/History | E2E web hiển thị tên/email REST | E2E/MANUAL |
| UC-07 | Cập nhật tên và timezone | Người dùng | `PUT /users/me`, Account | `account-profile.test.ts` test payload; E2E reload xác nhận tên mới | PARTIAL + E2E/MANUAL |

## B. Deadline, milestone và task

| ID | Use case | Actor | API / màn hình | Test hiện có | Coverage |
|---|---|---|---|---|---|
| UC-08 | Xem danh sách deadline | Người dùng | `GET /deadlines`, Plans | E2E/manual Plans đọc REST | E2E/MANUAL |
| UC-09 | Tạo deadline | Người dùng | `POST /deadlines`, Create Deadline | `deadline-create.test.ts` mapper; E2E tạo và thấy trong Plans | PARTIAL + E2E/MANUAL |
| UC-10 | Xem chi tiết deadline kèm hierarchy | Người dùng | `GET /deadlines/{id}`, Deadline Detail | E2E/manual flow | E2E/MANUAL |
| UC-11 | Sửa deadline | Người dùng | `PUT /deadlines/{id}` | REST smoke flow; không có test REST tự động | E2E/MANUAL |
| UC-12 | Xoá deadline | Người dùng | `DELETE /deadlines/{id}` | REST smoke flow; không có test REST tự động | E2E/MANUAL |
| UC-13 | Xem risk của deadline | Người dùng | `GET /deadlines/{id}/risk` | REST smoke flow; không có test REST tự động | E2E/MANUAL |
| UC-14 | Tạo milestone thuộc deadline | Người dùng | `POST /milestones` | E2E/manual flow trong Deadline Detail | E2E/MANUAL |
| UC-15 | Sửa milestone | Người dùng | `PUT /milestones/{id}` | REST smoke flow; không có test REST tự động | E2E/MANUAL |
| UC-16 | Xoá milestone | Người dùng | `DELETE /milestones/{id}` | REST smoke flow; không có test REST tự động | E2E/MANUAL |
| UC-17 | Tạo task thuộc milestone | Người dùng | `POST /tasks` | E2E/manual flow trong Deadline Detail | E2E/MANUAL |
| UC-18 | Xem task và sessions của task | Người dùng | `GET /tasks/{id}`, Task Detail | E2E/manual flow | E2E/MANUAL |
| UC-19 | Sửa task | Người dùng | `PUT /tasks/{id}` | REST smoke flow; không có test REST tự động | E2E/MANUAL |
| UC-20 | Xoá task | Người dùng | `DELETE /tasks/{id}` | REST smoke flow; không có test REST tự động | E2E/MANUAL |
| UC-21 | Lọc/tìm kiếm/trình bày Plans | Người dùng | Plans (client-side) | `plan-presentation.test.ts` cho API→card mapper | PARTIAL |
| UC-22 | Mở deep-link legacy deadline/task/milestone | Người dùng | `detail-*`, `edit-*`, `create-*` legacy routes | `legacy-route.test.ts` kiểm tra redirect resource/fallback | AUTO |

## C. Focus session và review

| ID | Use case | Actor | API / màn hình | Test hiện có | Coverage |
|---|---|---|---|---|---|
| UC-23 | Lập focus session cho task | Người dùng | `POST /sessions`, Session Plan | API test flow + REST/E2E manual | E2E/MANUAL |
| UC-24 | Xem / đổi lịch session | Người dùng | `GET/PUT /sessions/{id}` | REST smoke flow | E2E/MANUAL |
| UC-25 | Huỷ session | Người dùng | `DELETE /sessions/{id}` | REST smoke flow | E2E/MANUAL |
| UC-26 | Bắt đầu session | Người dùng | `POST /sessions/{id}/start` | REST/E2E manual; `api-test-flow.test.ts` chỉ test thứ tự UI flow | E2E/MANUAL |
| UC-27 | Tạm dừng session | Người dùng | `POST /sessions/{id}/pause` | REST smoke flow | E2E/MANUAL |
| UC-28 | Tiếp tục session | Người dùng | `POST /sessions/{id}/resume` | REST smoke flow | E2E/MANUAL |
| UC-29 | Kết thúc sớm / hoàn thành session | Người dùng | `POST /sessions/{id}/end` | REST/E2E manual | E2E/MANUAL |
| UC-30 | Review và cập nhật progress task | Người dùng | `POST /sessions/{id}/review` | REST/E2E manual; API test flow xác nhận thứ tự review | E2E/MANUAL |
| UC-31 | Tạo follow-up session | Người dùng | `POST /sessions` với `previous_session_id` | REST smoke flow | E2E/MANUAL |
| UC-32 | Xem lịch sử session | Người dùng | `GET /sessions/history`, History | `backend-route-order.test.ts`; E2E History empty state | PARTIAL + E2E/MANUAL |
| UC-33 | Mở deep-link legacy session/plan/focus/review | Người dùng | route session legacy | `legacy-route.test.ts` | AUTO |

## D. Dashboard và cài đặt

| ID | Use case | Actor | API / màn hình | Test hiện có | Coverage |
|---|---|---|---|---|---|
| UC-34 | Xem dashboard hôm nay | Người dùng | `GET /dashboard/today`, Today | REST/E2E manual | E2E/MANUAL |
| UC-35 | Xem tổng hợp profile/focus time | Người dùng | Me + History API | `history-presentation.test.ts`; E2E Me | PARTIAL + E2E/MANUAL |
| UC-36 | Lưu major và năm tốt nghiệp (local) | Người dùng | Account + AsyncStorage | `settings-preferences.test.ts` | AUTO |
| UC-37 | Lưu focus preferences (local) | Người dùng | Focus Settings + AsyncStorage | `settings-preferences.test.ts` | AUTO |
| UC-38 | Lưu notification preferences (local) | Người dùng | Notification Settings + AsyncStorage | `settings-preferences.test.ts` round-trip Notification preferences | AUTO |

## E. Danh mục test hiện có

| Test file | Nội dung kiểm tra | Trạng thái lần chạy gần nhất |
|---|---|---|
| `tests/domain/account-profile.test.ts` | Chuẩn hoá payload profile | PASS |
| `tests/domain/api-error.test.ts` | Chuẩn hoá lỗi API | PASS |
| `tests/domain/api-test-flow.test.ts` | Thứ tự API test screen | PASS |
| `tests/domain/backend-route-order.test.ts` | `/sessions/history` đứng trước route UUID | PASS |
| `tests/domain/deadline-create.test.ts` | Payload tạo deadline | PASS |
| `tests/domain/history-presentation.test.ts` | Tổng hợp history/task title từ REST | PASS |
| `tests/domain/legacy-route.test.ts` | Điều hướng legacy route | PASS |
| `tests/domain/logout.test.ts` | Logout xoá API session/store | PASS |
| `tests/domain/plan-presentation.test.ts` | Mapper deadline sang Plans card | PASS |
| `tests/domain/settings-preferences.test.ts` | Round-trip account/focus preferences | PASS |
| `tests/integration/auth-rls.test.ts` | Supabase profile/settings RLS cũ | SKIP |
| `tests/integration/demo-flow.test.ts` | Supabase demo flow cũ | SKIP |
| `tests/integration/plans-rls.test.ts` | Supabase deadline hierarchy/RLS cũ | SKIP |
| `tests/integration/session-lifecycle.test.ts` | Supabase session RPC cũ | SKIP |
| `tests/integration/session-review.test.ts` | Tên Supabase RPC cũ | SKIP |

## Kết luận coverage

- `pnpm test`: **10 test files pass, 12 assertions pass; 5 files / 10 assertions skip**.
- Đợt REST E2E 18/08/2026: **30/30 use case REST PASS**, bao gồm Auth, Profile, deadline/milestone/task CRUD, session lifecycle, review/follow-up, history, dashboard và cleanup dữ liệu.
- Đợt web E2E 18/08/2026: Today, Plans, Me, Account, History, Focus/Notification Settings, Create Deadline, logout và legacy redirects đã truy cập/kiểm tra; **UC-05 là FAIL** vì đang mô phỏng reset password.
- Ngoại trừ UC-05, các use case runtime chính đã có bằng chứng E2E/manual hoặc test tự động.
- Các khoảng trống cần ưu tiên nếu muốn đưa coverage REST lên mức CI: test API FastAPI tự động cho Auth/Profile, Deadline/Milestone/Task CRUD, toàn bộ Session lifecycle/review/follow-up, dashboard/risk và Notification preferences.
