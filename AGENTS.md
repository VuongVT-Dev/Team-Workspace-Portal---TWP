# Đặc Tả Kỹ Thuật & Rules Cho Google Antigravity (AGENTS.md / PROJECT_SPEC.md)

> **Hướng dẫn sử dụng với [Google Antigravity](https://antigravity.google/docs/overview/):**
> 1. Bạn có thể lưu trực tiếp file này vào thư mục gốc của dự án dưới tên `AGENTS.md` hoặc `GEMINI.md` theo quy chuẩn [Antigravity Workspace Rules](https://antigravity.google/docs/rules/) để Agent tự động đọc toàn bộ kiến trúc và ràng buộc nghiệp vụ.
> 2. Hoặc copy toàn bộ nội dung file này dán vào khung chat của Agent trong Antigravity kèm câu lệnh: *"Hãy khởi tạo và viết trọn bộ source code Backend (Spring Boot) và Frontend (React + Vite) theo đúng đặc tả trong file này."*

---

## 1. Tổng Quan Dự Án & Mục Tiêu Hệ Thống

Xây dựng cổng thông tin nội bộ (**Team Workspace Portal**) dành riêng cho nhóm sinh viên (3–5 thành viên) phối hợp thực hiện đồ án tốt nghiệp. Hệ thống tập trung vào sự tinh gọn, tốc độ phản hồi nhanh, phân quyền rõ ràng giữa người giao việc (`Assigner`) và người nhận việc (`Assignee`), theo dõi tiến độ theo giai đoạn (`Phase`), tìm giờ rảnh chung từ lịch học và đồng bộ môi trường lập trình.

### Nguyên tắc cốt lõi (Hard Constraints cho AI Agent)
1. **Không có trang Đăng ký công khai (No Public Sign-up):** Chỉ đăng nhập bằng tài khoản được cấp sẵn (khởi tạo tự động qua `DataInitializer` khi chạy Backend).
2. **Bảo mật dữ liệu cá nhân tối giản (Privacy-First Profile):** Hồ sơ sinh viên chỉ lưu trữ và hiển thị đúng 4 thông tin: **Ảnh đại diện (`avatarUrl`)**, **Họ và tên (`fullName`)**, **Email (`email`)**, và **Mã số sinh viên (`studentCode`)**. Tuyệt đối **không** tạo các trường CCCD/CMND, số điện thoại, ngày tháng năm sinh hay địa chỉ nhà.
3. **Quy tắc tính phần trăm tiến độ Phase:** Mỗi công việc (`Task`) thuộc về một giai đoạn (`Phase`) do Admin thiết lập. Thanh tiến độ (`Progress Bar`) của Phase **chỉ cộng phần trăm khi Task đạt trạng thái `REVIEW` hoặc `DONE`**. Các trạng thái `BACKLOG`, `PENDING`, `PROCESSING` tính là `0%`.
4. **Quy tắc phân quyền Review nghiêm ngặt:** Chỉ người tạo/giao công việc đó (`task.assigner.id == currentUser.id`) mới có quyền nhập nhận xét review (`reviewComment`), chấm kết quả hoặc duyệt task ở tab **Tiến độ và Review**.
5. **Cơ sở dữ liệu:** Microsoft SQL Server (MSSQL), user: `sa`, password: `123456`, Database: `team_workspace_portal`.
