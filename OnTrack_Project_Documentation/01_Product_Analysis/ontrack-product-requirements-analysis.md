# Deadline Focus App — Product Requirements Analysis

## 1. Document Purpose

Tài liệu này tổng hợp phần phân tích sản phẩm và yêu cầu hệ thống trước khi chuyển sang:

- Thiết kế danh sách màn hình UI.
- Thiết kế luồng điều hướng.
- Thiết kế wireframe.
- Thiết kế database.
- Lập kế hoạch triển khai mobile app.

---

## 2. Product Overview

**Deadline Focus App** là ứng dụng mobile giúp sinh viên biến một deadline lớn thành các phần việc nhỏ có thể thực thi, theo dõi tiến độ thực tế qua từng phiên tập trung và cảnh báo sớm nguy cơ trễ hạn.

### Core value proposition

> Ứng dụng không chỉ cho người dùng biết deadline là ngày nào, mà còn giúp họ biết hôm nay cần làm gì và liệu tốc độ hiện tại có đủ để hoàn thành đúng hạn hay không.

### Product flow

```text
Plan → Execute → Review → Track Progress → Detect Risk
```

---

## 3. Target User

### Primary user

Sinh viên có nhiều bài tập, đồ án hoặc kỳ thi với deadline khác nhau.

### Typical characteristics

- Thường ghi deadline nhưng không chia nhỏ công việc.
- Không biết hôm nay cần hoàn thành bao nhiêu.
- Dễ trì hoãn hoặc mất tập trung.
- Chỉ nhận ra mình trễ khi deadline đã quá gần.
- Cần một công cụ đơn giản để lập kế hoạch và thực thi.

---

## 4. Problem Statement

Sinh viên thường không hoàn thành deadline đúng hạn không chỉ vì quên deadline, mà còn vì:

1. Không chia công việc lớn thành các giai đoạn rõ ràng.
2. Không chia task thành các phiên làm việc cụ thể.
3. Không theo dõi tiến độ thực tế sau mỗi phiên.
4. Không biết tốc độ hiện tại có đủ để hoàn thành đúng hạn.
5. Dễ bị phân tâm trong quá trình thực hiện.

---

## 5. Product Hypothesis

> Chúng tôi tin rằng sinh viên thường trễ deadline vì không biết cách chuyển một mục tiêu lớn thành các đơn vị thực thi nhỏ và không phát hiện sớm khi tiến độ thực tế thấp hơn tiến độ cần thiết.

Nếu ứng dụng cho phép người dùng:

- Chia deadline thành milestone.
- Chia milestone thành task.
- Thực hiện task qua nhiều focus session.
- Đánh giá tiến độ sau mỗi session.
- Nhận cảnh báo nguy cơ trễ.

Thì người dùng sẽ chủ động điều chỉnh kế hoạch trước khi deadline trở nên mất kiểm soát.

---

## 6. Product Scope

### In Scope — MVP

- Authentication.
- CRUD Deadline.
- CRUD Milestone.
- CRUD Task.
- CRUD Session.
- Session scheduling.
- Normal Focus Mode.
- High Focus Mode.
- Timer.
- Local notification.
- Post-session review.
- Follow-up session.
- Progress tracking.
- Deadline risk detection.
- Dashboard.
- Session history.

### Out of Scope — MVP

- AI tự động chia task.
- Chatbot.
- Social network.
- Leaderboard.
- Gamification phức tạp.
- Team collaboration.
- Marketplace.
- Google Calendar synchronization hai chiều.
- Chặn tuyệt đối toàn bộ ứng dụng khác.
- Thuật toán lập lịch thông minh phức tạp.
- Phiên bản iOS hoàn chỉnh.

---

## 7. Domain Model

Cấu trúc nghiệp vụ chính:

```text
User
└── Deadline
    └── Milestone
        └── Task
            └── Session
```

### Important distinction

- **Task** là công việc cần hoàn thành đến 100%.
- **Session** là một lần tập trung để tăng tiến độ của Task.

Một Task có thể cần nhiều Session.

---

## 8. Entity Analysis

## 8.1 User

### Purpose

Đại diện cho người sử dụng hệ thống.

### Main attributes

- id
- fullName
- email
- passwordHash hoặc authenticationProvider
- timezone
- createdAt
- updatedAt

---

## 8.2 Deadline

### Purpose

Đại diện cho mục tiêu lớn cần hoàn thành trước một hạn chót.

### Main attributes

- id
- userId
- title
- description
- dueAt
- priority
- status
- progress
- riskLevel
- createdAt
- updatedAt

### Priority

```text
LOW
MEDIUM
HIGH
```

### Status

```text
PLANNING
IN_PROGRESS
AT_RISK
COMPLETED
OVERDUE
```

---

## 8.3 Milestone

### Purpose

Đại diện cho một giai đoạn hoặc kết quả lớn thuộc Deadline.

### Main attributes

- id
- deadlineId
- title
- description
- targetAt
- position
- status
- progress
- createdAt
- updatedAt

### Status

```text
NOT_STARTED
IN_PROGRESS
COMPLETED
OVERDUE
```

---

## 8.4 Task

### Purpose

Đại diện cho công việc cụ thể cần hoàn thành đến 100%.

### Main attributes

- id
- milestoneId
- title
- description
- priority
- currentProgress
- status
- createdAt
- updatedAt

### Status

```text
NOT_STARTED
IN_PROGRESS
COMPLETED
CANCELLED
```

### Progress rule

```text
0 <= currentProgress <= 100
```

Task được xem là hoàn thành khi:

```text
currentProgress = 100
```

---

## 8.5 Session

### Purpose

Đại diện cho một lần tập trung để thực hiện Task.

### Main attributes

- id
- taskId
- plannedStartAt
- estimatedMinutes
- focusMode
- status
- progressBefore
- progressAfter
- startedAt
- expectedEndAt
- endedAt
- actualMinutes
- resultNote
- exitCount
- createdAt
- updatedAt

### Focus Mode

```text
NORMAL
HIGH
```

### Status

```text
PLANNED
IN_PROGRESS
PAUSED
COMPLETED
ENDED_EARLY
SKIPPED
CANCELLED
```

### Progress validation

```text
progressAfter >= progressBefore
progressAfter <= 100
```

---

## 9. Focus Modes

## 9.1 Normal Focus

- Chạy timer.
- Không chặn thông báo.
- Cho phép chuyển ứng dụng.
- Có thể tạm dừng.
- Phù hợp với nghiên cứu, đọc tài liệu hoặc trao đổi nhóm.

## 9.2 High Focus

- Chạy timer.
- Tích hợp hoặc hướng dẫn bật Do Not Disturb.
- Giảm thông báo và gián đoạn.
- Có thể ghi nhận số lần rời ứng dụng.
- Phù hợp với code, viết báo cáo và deep work.

### Technical constraint

Ứng dụng không cam kết chặn tuyệt đối mọi thông báo. High Focus phụ thuộc vào quyền hệ điều hành và sự cho phép của người dùng.

---

## 10. Session Lifecycle

```text
PLANNED
→ IN_PROGRESS
→ PAUSED hoặc COMPLETED hoặc ENDED_EARLY
```

### Starting a Session

Khi người dùng bắt đầu:

1. Lưu `startedAt`.
2. Tính `expectedEndAt`.
3. Cập nhật status thành `IN_PROGRESS`.
4. Schedule local notification.
5. Kích hoạt High Focus nếu được chọn và có quyền.

### Timer rule

Không chỉ giảm một biến mỗi giây.

```text
remainingTime = expectedEndAt - currentTime
```

Điều này giúp timer vẫn chính xác khi app chạy nền hoặc được mở lại.

### Ending a Session

Session có thể kết thúc do:

- Hết thời lượng.
- Người dùng kết thúc sớm.
- Người dùng hủy.
- Người dùng bỏ qua phiên.

---

## 11. Post-Session Review

Sau khi kết thúc Session, người dùng thực hiện review.

### Required input

- Chọn tiến độ mới của Task.
- Nhập ghi chú kết quả.
- Xem thời lượng thực tế.

### Optional input

- Tự đánh giá mức tập trung.
- Ghi lý do chưa hoàn thành.
- Quyết định tạo Session tiếp theo.

### Progress example

```text
Session 1: 0% → 40%
Session 2: 40% → 75%
Session 3: 75% → 100%
```

Session tiếp theo kế thừa tiến độ từ Session trước:

```text
nextSession.progressBefore = previousSession.progressAfter
```

---

## 12. Follow-up Session Logic

Nếu `progressAfter < 100`, hệ thống hỏi:

> Bạn có muốn tạo phiên tiếp theo để hoàn thành Task này không?

### Create Follow-up

Hệ thống tự điền:

- Task hiện tại.
- Progress bắt đầu.
- Priority của Task.
- Focus Mode trước đó.
- Nội dung hoặc ghi chú còn lại.

Người dùng chọn lại:

- Ngày giờ thực hiện.
- Thời lượng dự kiến.
- Focus Mode.
- Ghi chú bổ sung.

### If progress reaches 100%

- Task chuyển sang `COMPLETED`.
- Không hỏi tạo Session tiếp theo.
- Cập nhật tiến độ Milestone.
- Cập nhật tiến độ Deadline.
- Xử lý các Session tương lai chưa chạy của Task.

---

## 13. Progress Calculation

## 13.1 Task Progress

```text
Task progress = progressAfter của Session gần nhất
```

Hoặc giá trị được người dùng cập nhật hợp lệ gần nhất.

## 13.2 Milestone Progress

MVP:

```text
Milestone progress
= Tổng tiến độ các Task / Số lượng Task
```

## 13.3 Deadline Progress

MVP:

```text
Deadline progress
= Tổng tiến độ các Milestone / Số lượng Milestone
```

### Limitation

Cách tính trung bình chưa xét trọng số khối lượng công việc. Có thể cải tiến sau MVP bằng estimated effort hoặc task weight.

---

## 14. Risk Detection

### Goal

Phát hiện sớm Deadline có nguy cơ không hoàn thành đúng hạn.

### Basic signals

- Số ngày còn lại.
- Tiến độ hiện tại.
- Tiến độ kỳ vọng.
- Task chưa hoàn thành.
- Session bị bỏ hoặc dời lịch.
- Milestone đã vượt target date.
- Năng lực hoàn thành trung bình của người dùng.

### MVP rule

So sánh tiến độ kỳ vọng theo thời gian với tiến độ thực tế.

```text
expectedProgress
= elapsedTime / totalAvailableTime × 100
```

```text
progressGap
= expectedProgress - actualProgress
```

### Suggested classification

```text
ON_TRACK:
actualProgress gần hoặc cao hơn expectedProgress

AT_RISK:
actualProgress thấp hơn expectedProgress đáng kể

OVERDUE:
currentTime > dueAt và progress < 100
```

### Example

```text
Thời gian đã trôi qua: 60%
Tiến độ thực tế: 30%
Kết luận: AT_RISK
```

### Actionable output

Không chỉ hiển thị “At Risk”, app cần đưa ra thông điệp hành động:

```text
Deadline còn 5 ngày.
Bạn còn 8 Task/Session cần xử lý.
Hôm nay cần hoàn thành ít nhất 2 phiên để giữ đúng tiến độ.
```

---

## 15. Functional Requirements

## 15.1 Authentication

- Người dùng có thể đăng ký.
- Người dùng có thể đăng nhập.
- Người dùng có thể đăng xuất.
- Người dùng có thể đặt lại mật khẩu.

## 15.2 Deadline Management

- Tạo Deadline.
- Xem danh sách Deadline.
- Xem chi tiết Deadline.
- Chỉnh sửa Deadline.
- Xóa Deadline.
- Lọc và sắp xếp Deadline.

## 15.3 Milestone Management

- Tạo Milestone trong Deadline.
- Xem danh sách Milestone.
- Xem chi tiết Milestone.
- Chỉnh sửa Milestone.
- Xóa Milestone.
- Sắp xếp Milestone.

## 15.4 Task Management

- Tạo Task trong Milestone.
- Xem danh sách Task.
- Xem chi tiết Task.
- Chỉnh sửa Task.
- Xóa Task.
- Chọn priority.
- Xem progress.
- Đánh dấu hoàn thành thủ công khi cần.

## 15.5 Session Planning

- Tạo Session cho Task.
- Chọn ngày giờ dự kiến.
- Chọn thời lượng dự kiến.
- Chọn Focus Mode.
- Chỉnh sửa Session.
- Dời lịch Session.
- Hủy hoặc xóa Session.

## 15.6 Focus Session

- Bắt đầu Timer.
- Tạm dừng.
- Tiếp tục.
- Kết thúc sớm.
- Timer chính xác khi app chạy nền.
- Nhận local notification khi hết thời gian.
- Kích hoạt High Focus khi được cấp quyền.

## 15.7 Post-Session Review

- Chọn progress mới.
- Ghi kết quả sau phiên.
- Xem thời lượng thực tế.
- Tạo Follow-up Session.
- Cập nhật Task Progress.

## 15.8 Progress Tracking

- Xem Task Progress.
- Xem Milestone Progress.
- Xem Deadline Progress.
- Xem lịch sử Session.
- So sánh thời lượng dự kiến và thực tế.

## 15.9 Risk Detection

- Phát hiện Deadline có nguy cơ trễ.
- Hiển thị risk badge.
- Cảnh báo Milestone trễ target.
- Gợi ý khối lượng cần hoàn thành hôm nay.

## 15.10 Dashboard and Notifications

- Xem Session hôm nay.
- Xem Deadline sắp đến hạn.
- Xem Deadline có nguy cơ trễ.
- Nhận nhắc trước Session.
- Mở đúng Session khi bấm notification.

---

## 16. Use Case Summary

### Actor

```text
User
```

### Main Use Case Groups

1. Authentication.
2. Deadline Management.
3. Milestone Management.
4. Task Management.
5. Session Planning.
6. Focus Session.
7. Post-Session Review.
8. Progress Tracking.
9. Risk Detection.
10. Dashboard and Notifications.

### Main User Flow

```text
Đăng nhập
→ Tạo Deadline
→ Tạo Milestone
→ Tạo Task
→ Tạo và lên lịch Session
→ Bắt đầu Focus Session
→ Kết thúc và đánh giá kết quả
→ Tạo Follow-up Session nếu cần
→ Cập nhật tiến độ
→ Phát hiện nguy cơ trễ
```

---

## 17. Business Rules

### Deadline Rules

- Deadline due date phải lớn hơn thời điểm tạo.
- Deadline chỉ hoàn thành khi progress đạt 100%.
- Khi due date đã qua và progress dưới 100%, status là `OVERDUE`.

### Milestone Rules

- Milestone phải thuộc một Deadline.
- Target date không nên vượt Deadline due date.
- Milestone progress được tính từ các Task bên trong.

### Task Rules

- Task phải thuộc một Milestone.
- Task progress không nhỏ hơn 0 hoặc lớn hơn 100.
- Task đạt 100% thì status là `COMPLETED`.

### Session Rules

- Session phải thuộc một Task.
- `plannedStartAt` phải là thời gian hợp lệ.
- `estimatedMinutes` phải lớn hơn 0.
- `progressAfter` không được nhỏ hơn `progressBefore`.
- Một Task có thể có nhiều Session.
- Một Session chỉ có một lần thực thi chính thức trong MVP.

### Follow-up Rules

- Chỉ tạo Follow-up Session khi Task progress dưới 100%.
- Follow-up Session bắt đầu từ progress hiện tại.
- Follow-up Session không tạo Task mới.

---

## 18. Non-Functional Requirements

### Usability

- Người dùng phải tạo được Deadline trong ít bước.
- Dashboard phải cho biết rõ việc cần làm hôm nay.
- High Focus và Normal Focus phải dễ phân biệt.

### Reliability

- Timer phải phục hồi khi app chạy nền.
- Session đang chạy không được mất khi app bị đóng.
- Notification phải được hủy khi Session kết thúc sớm.

### Performance

- Màn hình chính tải nhanh.
- CRUD phải phản hồi rõ trạng thái loading, success và error.
- Timer không được phụ thuộc hoàn toàn vào Internet.

### Security

- Mỗi người dùng chỉ truy cập dữ liệu của chính mình.
- Token phải được lưu bằng secure storage.
- Backend cần áp dụng access control hoặc Row Level Security.

### Maintainability

- Code tổ chức theo feature.
- Tách UI, state và data access.
- Business rules không đặt trực tiếp trong widget UI.

---

## 19. MVP Success Metrics

### Product metrics

- Số Deadline được tạo.
- Tỷ lệ Deadline có Milestone và Task.
- Số Session được lên lịch.
- Tỷ lệ Session được bắt đầu.
- Tỷ lệ Session được review.
- Tỷ lệ người dùng tạo Follow-up Session.
- Tỷ lệ Deadline hoàn thành đúng hạn.

### Validation goals

- Phỏng vấn ít nhất 8 người.
- Có ít nhất 5 người dùng thử.
- Có ít nhất 3 người quay lại lần hai.
- Thu được ít nhất 10 feedback cụ thể.
- Có ít nhất 2 vòng cải tiến dựa trên feedback.

---

## 20. Founder Learning Goals

Đồ án không chỉ nhằm hoàn thành yêu cầu môn học. Nó được dùng để luyện:

- Problem discovery.
- User interview.
- Scope control.
- MVP definition.
- Product hypothesis.
- User behavior tracking.
- Feedback-driven iteration.
- Technical feasibility.
- Product prioritization.

### Founder principle

> Không đo chất lượng sản phẩm bằng số lượng tính năng. Đo bằng mức độ sản phẩm giúp người dùng hoàn thành hành vi quan trọng.

---

## 21. Next Design Phase

Sau khi tài liệu này được khóa, các bước tiếp theo là:

1. Chuyển Use Case thành danh sách màn hình UI.
2. Xác định Information Architecture.
3. Thiết kế App Navigation.
4. Vẽ User Flow.
5. Vẽ Wireframe.
6. Thiết kế Database ERD.
7. Chốt Mobile Architecture.
8. Lập Product Backlog.
9. Chia MVP thành Sprint.
