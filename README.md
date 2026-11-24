# TEAM WORKSPACE PORTAL (WSP)

> **Cổng thông tin nội bộ cho nhóm sinh viên làm Đồ án tốt nghiệp**  
> Kiến trúc: **3-Layer with Repository Architecture** (Spring Boot 3 + MS SQL Server) & **React (Vite + Tailwind CSS)**.

---

## 1. Thông Tin Cấu Hình & Tài Khoản Mặc Định

### 1.1. Cơ sở dữ liệu Microsoft SQL Server (MSSQL)
* **Host / Port:** `localhost:1433`
* **Database Name:** `team_workspace_portal`
* **Username:** `sa`
* **Password:** `123456`
* **Script khởi tạo CSDL:** `database/init.sql` (Chạy trong SSMS hoặc Azure Data Studio để tạo database `team_workspace_portal`).

### 1.2. Tài khoản đăng nhập mặc định (Tự động Seed khi chạy Backend)
| Username | Password | Họ và tên | Vai trò (Role) | Ghi chú |
| :--- | :--- | :--- | :--- | :--- |
| **`admin`** | `admin123` | Trần Minh Quân | `ADMIN` | Nhóm trưởng (có quyền tạo Phase mới) |
| **`member1`** | `member123` | Lê Thu Hà | `MEMBER` | Thành viên |
| **`member2`** | `member123` | Nguyễn Văn Hùng | `MEMBER` | Thành viên |
| **`member3`** | `member123` | Phạm Đức Thắng | `MEMBER` | Thành viên |
| **`member4`** | `member123` | Vũ Hải Yến | `MEMBER` | Thành viên |

---

## 2. Cấu Trúc Dự Án Tại `D:\WorkSpace Portal (WSP)`

```text
D:\WorkSpace Portal (WSP)\
├── backend/                           # Dự án Spring Boot 3 (Maven, Java 21)
│   ├── pom.xml                        # Khai báo Spring Web, Data JPA, Security, MSSQL Driver, JWT, Validation
│   └── src/main/
│       ├── java/com/team/portal/
│       │   ├── config/                # SecurityConfig, JwtTokenProvider, DataInitializer (Seed Data)
│       │   ├── controller/            # 8 REST Controllers chuẩn hóa
│       │   ├── dto/                   # Request & Response DTOs với Validation đầy đủ
│       │   ├── entity/                # 8 JPA Entities + 8 Enums (User, Phase, Task, Schedule, Meeting...)
│       │   ├── exception/             # GlobalExceptionHandler (bắt lỗi 400 Validation, 403 Forbidden...)
│       │   ├── repository/            # 8 Spring Data JPA Repositories
│       │   └── service/               # 3-Layer Services (Kiểm tra quyền Assigner, tính % Phase)
│       └── resources/
│           └── application.properties # Cấu hình kết nối MSSQL (sa / 123456)
├── frontend/                          # Dự án React 18 + Vite + Tailwind CSS
│   ├── package.json
│   ├── vite.config.js                 # Proxy tự động forward /api sang http://localhost:8080
│   └── src/
│       ├── api/                       # axiosClient.js (gắn JWT Bearer) & API modules
│       ├── context/                   # AuthContext.jsx quản lý JWT & User
│       ├── layouts/                   # MainLayout.jsx (Left Sidebar cố định 260px)
│       ├── pages/                     # LoginPage, WorkspacePage, ScheduleLeavePage, MeetingPage...
│       └── components/workspace/      # MyTasksTab (8 cột), BoardAssignTab (Kanban), ProgressReviewTab...
├── database/
│   └── init.sql                       # Script tạo Database trên Microsoft SQL Server
└── Postman/
    └── Team_Workspace_Portal.postman_collection.json # Bộ test trọn gói 20+ API tự động lưu Token
```

---

## 3. Hướng Dẫn Mở & Chạy Dự Án Bằng IntelliJ IDEA

### Bước 1: Mở Backend trong IntelliJ IDEA
1. Khởi động **IntelliJ IDEA**.
2. Chọn **Open** $\rightarrow$ Trỏ tới thư mục `D:\WorkSpace Portal (WSP)\backend`.
3. IntelliJ IDEA sẽ tự động nhận diện `pom.xml`, tải các thư viện từ Maven Central và lập chỉ mục (index).
4. Đảm bảo dịch vụ **SQL Server** trên máy của bạn đang chạy và database `team_workspace_portal` đã được tạo (xem file `database/init.sql`).
5. Mở file `com.team.portal.TeamPortalApplication.java` $\rightarrow$ Nhấp chuột phải chọn **Run 'TeamPortalApplication'**.
6. Khi khởi động lần đầu, `DataInitializer` sẽ tự động tạo bảng và nạp 5 tài khoản mẫu, 3 Phase và các Task mẫu.
   * *Backend chạy tại:* `http://localhost:8080`

### Bước 2: Chạy Frontend (React + Vite)
1. Mở Terminal trong IntelliJ IDEA (hoặc PowerShell ngoài):
   ```bash
   cd "D:\WorkSpace Portal (WSP)\frontend"
   npm install
   npm run dev
   ```
2. Mở trình duyệt truy cập: `http://localhost:5173`.
3. Đăng nhập bằng tài khoản `admin` / `admin123` hoặc `member1` / `member123`.

---

## 4. Kiểm Thử REST API Bằng Postman

1. Mở ứng dụng **Postman**.
2. Chọn **Import** $\rightarrow$ Chọn file:
   `D:\WorkSpace Portal (WSP)\Postman\Team_Workspace_Portal.postman_collection.json`
3. Chạy request **1. Auth $\rightarrow$ Login as Admin**:
   * Token JWT sẽ được **tự động lưu vào biến collection `{{token}}`**.
4. Bạn có thể lần lượt chạy tất cả các request trong bộ sưu tập (Phases, Tasks, Review, Schedules, Meetings, Documents, Extensions) mà không cần copy paste token thủ công.
