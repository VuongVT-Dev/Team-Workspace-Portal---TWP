-- ====================================================================================
-- TEAM WORKSPACE PORTAL TWP - DATABASE SCHEMA & SEED DATA SCRIPT FOR MS SQL SERVER
-- Tương thích 100% với Spring Boot 3 Hibernate Entity & Quy chuẩn phân quyền TWP
-- Mật khẩu mặc định:
--   admin   (ADMIN / TEAM_LEADER)  : admin123
--   member1 (MEMBER / TEAM_LEADER) : member123  (Có quyền tạo Task & Review task mình tạo)
--   member2 (MEMBER / CO_LEADER)   : member123  (Có quyền tạo Task & Review task mình tạo)
--   member3 (MEMBER / MEMBER)      : member123  (Thành viên thường: không thể tạo Task / không thể chuyển Reviewing)
--   member4 (MEMBER / MEMBER)      : member123  (Thành viên thường)
-- ====================================================================================

USE master;
GO

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'team_workspace_portal')
BEGIN
    CREATE DATABASE team_workspace_portal;
    PRINT N'Đã tạo mới Database team_workspace_portal thành công.';
END
GO

USE team_workspace_portal;
GO

-- ====================================================================================
-- 2. TẠO HOẶC CẬP NHẬT CẤU TRÚC 8 BẢNG
-- ====================================================================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
BEGIN
    CREATE TABLE users (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        username NVARCHAR(50) NOT NULL UNIQUE,
        password_hash NVARCHAR(255) NOT NULL,
        full_name NVARCHAR(100) NOT NULL,
        email NVARCHAR(120) NOT NULL UNIQUE,
        student_code NVARCHAR(20) NOT NULL UNIQUE,
        avatar_url NVARCHAR(500),
        role NVARCHAR(20) NOT NULL,
        team_role NVARCHAR(20) NOT NULL DEFAULT 'MEMBER'
    );
END
ELSE
BEGIN
    IF COL_LENGTH('users', 'team_role') IS NULL
    BEGIN
        ALTER TABLE users ADD team_role NVARCHAR(20) NOT NULL DEFAULT 'MEMBER';
    END
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'phases')
BEGIN
    CREATE TABLE phases (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(150) NOT NULL,
        description NVARCHAR(MAX),
        display_order INT NOT NULL DEFAULT 1,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        created_by_user_id BIGINT FOREIGN KEY REFERENCES users(id)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'tasks')
BEGIN
    CREATE TABLE tasks (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        task_code NVARCHAR(30) UNIQUE,
        title NVARCHAR(200) NOT NULL,
        task_type NVARCHAR(30) NOT NULL,
        difficulty NVARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
        status NVARCHAR(20) NOT NULL DEFAULT 'BACKLOG',
        description NVARCHAR(MAX),
        attachment_url NVARCHAR(500),
        attachment_name NVARCHAR(255),
        note NVARCHAR(MAX),
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        work_submission_note NVARCHAR(MAX),
        review_comment NVARCHAR(MAX),
        reviewed_at DATETIME2,
        phase_id BIGINT NOT NULL FOREIGN KEY REFERENCES phases(id),
        assigner_id BIGINT NOT NULL FOREIGN KEY REFERENCES users(id),
        assignee_id BIGINT FOREIGN KEY REFERENCES users(id)
    );
END
ELSE
BEGIN
    IF COL_LENGTH('tasks', 'task_code') IS NULL
        ALTER TABLE tasks ADD task_code NVARCHAR(30) NULL;
    IF COL_LENGTH('tasks', 'description') IS NULL
        ALTER TABLE tasks ADD description NVARCHAR(MAX) NULL;
    IF COL_LENGTH('tasks', 'attachment_url') IS NULL
        ALTER TABLE tasks ADD attachment_url NVARCHAR(500) NULL;
    IF COL_LENGTH('tasks', 'attachment_name') IS NULL
        ALTER TABLE tasks ADD attachment_name NVARCHAR(255) NULL;
    IF COL_LENGTH('tasks', 'note') IS NULL
        ALTER TABLE tasks ADD note NVARCHAR(MAX) NULL;
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'schedule_entries')
BEGIN
    CREATE TABLE schedule_entries (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        day_of_week NVARCHAR(10) NOT NULL,
        shift NVARCHAR(20) NOT NULL,
        type NVARCHAR(10) NOT NULL,
        specific_date DATE,
        subject_or_reason NVARCHAR(200),
        user_id BIGINT NOT NULL FOREIGN KEY REFERENCES users(id)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'meetings')
BEGIN
    CREATE TABLE meetings (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        title NVARCHAR(200) NOT NULL,
        google_meet_link NVARCHAR(500) NOT NULL,
        start_time DATETIME2 NOT NULL,
        duration_minutes INT NOT NULL DEFAULT 60,
        take_note_content NVARCHAR(MAX),
        note_doc_url NVARCHAR(500),
        created_by_user_id BIGINT NOT NULL FOREIGN KEY REFERENCES users(id)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'meeting_logs')
BEGIN
    CREATE TABLE meeting_logs (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        logged_minutes INT NOT NULL DEFAULT 0,
        attendance_status NVARCHAR(20) NOT NULL DEFAULT 'PRESENT',
        contribution_note NVARCHAR(500),
        meeting_id BIGINT NOT NULL FOREIGN KEY REFERENCES meetings(id),
        user_id BIGINT NOT NULL FOREIGN KEY REFERENCES users(id)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'project_extensions')
BEGIN
    CREATE TABLE project_extensions (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        category NVARCHAR(50) NOT NULL,
        item_name NVARCHAR(150) NOT NULL,
        version NVARCHAR(50),
        description NVARCHAR(MAX),
        reference_url NVARCHAR(500),
        config_snippet NVARCHAR(MAX)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'documents')
BEGIN
    CREATE TABLE documents (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        title NVARCHAR(200) NOT NULL,
        category NVARCHAR(100) NOT NULL,
        file_url NVARCHAR(1000) NOT NULL,
        file_type NVARCHAR(50),
        file_size_kb BIGINT,
        uploaded_at DATETIME2 NOT NULL,
        uploaded_by_user_id BIGINT NOT NULL FOREIGN KEY REFERENCES users(id)
    );
END
GO

-- ====================================================================================
-- 3. XÓA DỮ LIỆU CŨ ĐỂ SEED LẠI SẠCH SẼ
-- ====================================================================================
DELETE FROM meeting_logs;
DELETE FROM meetings;
DELETE FROM schedule_entries;
DELETE FROM documents;
DELETE FROM tasks;
DELETE FROM phases;
DELETE FROM project_extensions;
DELETE FROM users;
GO

-- ====================================================================================
-- 4. INSERT DỮ LIỆU MẪU (TEAM WORKSPACE PORTAL TWP)
-- ====================================================================================

-- 4.1. Users (1 Admin, 1 Team Leader, 1 Co-Leader, 2 Normal Members)
SET IDENTITY_INSERT users ON;
INSERT INTO users (id, username, password_hash, full_name, email, student_code, avatar_url, role, team_role) VALUES
(1, 'admin',   '$2a$10$qr99T2xVsNG3d45uxyegcObTLlDBhISimh7RoCeBKsWPrgGx3MNrK', N'Trần Minh Quân (Admin)', 'quan.tm@fpt.edu.vn', 'SE160001', 'https://api.dicebear.com/7.x/bottts/svg?seed=admin',   'ADMIN',  'TEAM_LEADER'),
(2, 'member1', '$2a$10$4ulR2UjZqty1TxwDbyRc9u.ywWI2FkiklKyTbgnFLzjGhzr.LP9Ga', N'Lê Thu Hà',              'ha.lt@fpt.edu.vn',   'SE160002', 'https://api.dicebear.com/7.x/bottts/svg?seed=member1', 'MEMBER', 'TEAM_LEADER'),
(3, 'member2', '$2a$10$4ulR2UjZqty1TxwDbyRc9u.ywWI2FkiklKyTbgnFLzjGhzr.LP9Ga', N'Nguyễn Văn Hùng',        'hung.nv@fpt.edu.vn', 'SE160003', 'https://api.dicebear.com/7.x/bottts/svg?seed=member2', 'MEMBER', 'CO_LEADER'),
(4, 'member3', '$2a$10$4ulR2UjZqty1TxwDbyRc9u.ywWI2FkiklKyTbgnFLzjGhzr.LP9Ga', N'Phạm Đức Thắng',         'thang.pd@fpt.edu.vn','SE160004', 'https://api.dicebear.com/7.x/bottts/svg?seed=member3', 'MEMBER', 'MEMBER'),
(5, 'member4', '$2a$10$4ulR2UjZqty1TxwDbyRc9u.ywWI2FkiklKyTbgnFLzjGhzr.LP9Ga', N'Vũ Hải Yến',             'yen.vh@fpt.edu.vn',  'SE160005', 'https://api.dicebear.com/7.x/bottts/svg?seed=member4', 'MEMBER', 'MEMBER');
SET IDENTITY_INSERT users OFF;
GO

-- 4.2. Phases (3 Giai đoạn đồ án)
SET IDENTITY_INSERT phases ON;
INSERT INTO phases (id, name, description, display_order, start_date, end_date, created_by_user_id) VALUES
(1, N'Giai đoạn 1: Khảo sát & Phân tích yêu cầu (SRS)',
    N'Thu thập đặc tả hệ thống, phân tích bài toán, xác định các ràng buộc và thiết kế sơ đồ CSDL quan hệ.',
    1, CAST(DATEADD(DAY, -30, GETDATE()) AS DATE), CAST(DATEADD(DAY, -15, GETDATE()) AS DATE), 1),

(2, N'Giai đoạn 2: Hiện thực Backend & Frontend Core',
    N'Phát triển REST API với Spring Boot 3 & MSSQL, giao diện React Vite Tailwind, cơ chế phân quyền và review.',
    2, CAST(DATEADD(DAY, -14, GETDATE()) AS DATE), CAST(DATEADD(DAY, 15, GETDATE()) AS DATE), 1),

(3, N'Giai đoạn 3: Kiểm thử, Tối ưu & Viết báo cáo tốt nghiệp',
    N'Kiểm thử Postman API, tối ưu hiệu năng CSDL, đóng gói Docker và chuẩn bị Slide thuyết trình.',
    3, CAST(DATEADD(DAY, 16, GETDATE()) AS DATE), CAST(DATEADD(DAY, 45, GETDATE()) AS DATE), 1);
SET IDENTITY_INSERT phases OFF;
GO

-- 4.3. Tasks (Đủ 5 trạng thái: BACKLOG, PROCESSING, PENDING, REVIEWING, DONE + Cảnh báo ĐỎ / VÀNG)
SET IDENTITY_INSERT tasks ON;
INSERT INTO tasks (id, task_code, title, task_type, difficulty, status, description, attachment_url, attachment_name, note, start_date, end_date, work_submission_note, review_comment, reviewed_at, phase_id, assigner_id, assignee_id) VALUES
(1, 'TWP-001', N'Khảo sát nghiệp vụ và viết tài liệu SRS v1.0',
    'DOC', 'EASY', 'DONE',
    N'Viết đặc tả Use Case, phân quyền Admin/Member và quy trình 5 trạng thái Task.',
    '/uploads/documents/SRS_TeamWorkspacePortal_v1.0.pdf', N'SRS_TeamWorkspacePortal_v1.0.pdf',
    N'Tuân thủ mẫu tài liệu đồ án của khoa CNTT.',
    CAST(DATEADD(DAY, -28, GETDATE()) AS DATE), CAST(DATEADD(DAY, -22, GETDATE()) AS DATE),
    N'Đã hoàn thành file SRS v1.0 đầy đủ use cases tại thư mục docs nhóm.',
    N'Tài liệu đặc tả chi tiết, phân rã chức năng mạch lạc. Duyệt đạt 100%!',
    DATEADD(DAY, -21, GETDATE()), 1, 1, 2),

(2, 'TWP-002', N'Vẽ sơ đồ ERD & Thiết kế CSDL quan hệ trên MS SQL Server',
    'DRAW', 'MEDIUM', 'DONE',
    N'Thiết kế sơ đồ thực thể kết hợp (ERD) chuẩn hóa 3NF cho 8 bảng hệ thống.',
    '/uploads/documents/ERD_TeamWorkspacePortal.png', N'ERD_TeamWorkspacePortal.png',
    N'Đảm bảo nguyên tắc Privacy-First trên bảng users.',
    CAST(DATEADD(DAY, -21, GETDATE()) AS DATE), CAST(DATEADD(DAY, -16, GETDATE()) AS DATE),
    N'ERD 8 bảng chuẩn hóa 3NF, script DDL sẵn sàng tại database/seed_data.sql.',
    N'Kiến trúc bảng chuẩn chỉnh, quan hệ khóa ngoại chặt chẽ.',
    DATEADD(DAY, -15, GETDATE()), 1, 1, 3),

(3, 'TWP-003', N'Cấu hình Spring Boot 3, Spring Security & JWT Token Authentication',
    'CODE', 'MEDIUM', 'REVIEWING',
    N'Triển khai xác thực JWT, phân quyền ADMIN, TEAM_LEADER, CO_LEADER và MEMBER.',
    'https://github.com/team-twp/backend/pull/12', N'PR #12 - Auth & RBAC',
    N'Cần kiểm tra kỹ lỗi 403 Forbidden khi member thường thao tác quá quyền.',
    CAST(DATEADD(DAY, -12, GETDATE()) AS DATE), CAST(DATEADD(DAY, -2, GETDATE()) AS DATE),
    N'Đã hoàn thiện module Auth, cấp phát token JWT và filter Security. Xin trưởng nhóm review.',
    NULL, NULL, 2, 1, 4),

(4, 'TWP-004', N'Xây dựng giao diện Workspace Portal (React 18 + Vite + Tailwind CSS)',
    'CODE', 'HARD', 'PROCESSING',
    N'Phát triển màn hình Workspace, Kanban Board 5 cột và cảnh báo quá hạn Đỏ/Vàng.',
    NULL, NULL,
    N'Ưu tiên hoàn thành sớm vì đã trễ deadline dự kiến.',
    CAST(DATEADD(DAY, -10, GETDATE()) AS DATE), CAST(DATEADD(DAY, -1, GETDATE()) AS DATE),
    NULL, NULL, NULL, 2, 2, 5),

(5, 'TWP-005', N'Phân tích & Lập trình thuật toán tìm giờ rảnh chung từ Timetable',
    'ANALYST', 'MEDIUM', 'PENDING',
    N'Tổng hợp lịch học từ bảng schedule_entries và lọc ra các khung giờ rảnh chung cả đội.',
    NULL, NULL,
    N'Xử lý đầy đủ cả lịch học cố định lẫn lịch xin nghỉ phép.',
    CAST(DATEADD(DAY, -8, GETDATE()) AS DATE), CAST(DATEADD(DAY, -1, GETDATE()) AS DATE),
    N'Đã code xong thuật toán tìm giờ rảnh và kiểm thử dữ liệu mẫu, chuyển Pending chờ review.',
    NULL, NULL, 2, 1, 3),

(6, 'TWP-006', N'Viết bộ Test Cases & Kiểm thử toàn diện API bằng Postman',
    'TEST', 'MEDIUM', 'BACKLOG',
    N'Tạo bộ test case kiểm thử phân quyền Admin, Team Leader, Co-Leader và Member thường.',
    NULL, NULL,
    N'Task mở chưa chỉ định người làm — thành viên có thể bấm Nhận Task.',
    CAST(GETDATE() AS DATE), CAST(DATEADD(DAY, 10, GETDATE()) AS DATE),
    NULL, NULL, NULL, 2, 3, NULL),

(7, 'TWP-007', N'Thiết kế Slide thuyết trình đồ án tốt nghiệp cuối kỳ',
    'SLIDE', 'MEDIUM', 'BACKLOG',
    N'Chuẩn bị slide demo hệ thống Team Workspace Portal TWP cho hội đồng bảo vệ.',
    NULL, NULL,
    N'Dự kiến 20-25 slide, trình bày rõ kiến trúc 3-Layer và phân quyền.',
    CAST(DATEADD(DAY, 20, GETDATE()) AS DATE), CAST(DATEADD(DAY, 35, GETDATE()) AS DATE),
    NULL, NULL, NULL, 3, 1, NULL),

(8, 'TWP-008', N'Đóng gói Docker Compose & Viết hướng dẫn triển khai hệ thống',
    'OTHER', 'HARD', 'BACKLOG',
    N'Viết Dockerfile cho Backend/Frontend và file docker-compose.yml chạy 1 lệnh.',
    NULL, NULL,
    N'Kèm tài liệu hướng dẫn chạy local trên Windows & Linux.',
    CAST(DATEADD(DAY, 25, GETDATE()) AS DATE), CAST(DATEADD(DAY, 40, GETDATE()) AS DATE),
    NULL, NULL, NULL, 3, 1, 4);
SET IDENTITY_INSERT tasks OFF;
GO

-- 4.4. Schedule Entries
SET IDENTITY_INSERT schedule_entries ON;
INSERT INTO schedule_entries (id, day_of_week, shift, type, specific_date, subject_or_reason, user_id) VALUES
(1, 'MON', 'MORNING_1',   'CLASS', NULL, N'Môn Đồ Án Tốt Nghiệp (Phòng 402)', 1),
(2, 'MON', 'MORNING_1',   'CLASS', NULL, N'Học Tiếng Anh Chuyên Ngành',        2),
(3, 'TUE', 'AFTERNOON_1', 'CLASS', NULL, N'Điện toán đám mây (Cloud Computing)', 3),
(4, 'TUE', 'AFTERNOON_2', 'CLASS', NULL, N'An toàn và bảo mật hệ thống',       4),
(5, 'WED', 'MORNING_2',   'CLASS', NULL, N'Quản trị dự án phần mềm',          5),
(6, 'WED', 'AFTERNOON_1', 'LEAVE', NULL, N'Bận việc gia đình về quê',          3),
(7, 'THU', 'MORNING_1',   'CLASS', NULL, N'Học Kiến trúc phần mềm nâng cao',   1),
(8, 'THU', 'MORNING_2',   'CLASS', NULL, N'Học Kiến trúc phần mềm nâng cao',   2),
(9, 'FRI', 'EVENING',     'CLASS', NULL, N'Thực hành phát triển ứng dụng di động', 4),
(10,'SAT', 'MORNING_1',   'EXAM',  NULL, N'Thi chứng chỉ nghề nghiệp',         5);
SET IDENTITY_INSERT schedule_entries OFF;
GO

-- 4.5. Meetings & Meeting Logs
SET IDENTITY_INSERT meetings ON;
INSERT INTO meetings (id, title, google_meet_link, start_time, duration_minutes, take_note_content, note_doc_url, created_by_user_id) VALUES
(1, N'Họp Sprint Review Giai đoạn 1 & Phân công Task Giai đoạn 2',
    'https://meet.google.com/abc-xyz-twp',
    DATEADD(DAY, -5, DATEADD(HOUR, 19, CAST(CAST(GETDATE() AS DATE) AS DATETIME2))),
    60,
    N'### Nội dung buổi họp:
1. Đánh giá hoàn thành 100% tài liệu SRS và bản vẽ ERD.
2. Phân công task Sprint 2: Frontend Kanban 5 cột, Backend RBAC & Schedule API.
3. Thống nhất quy chuẩn Git Commit: feat:, fix:, docs:.',
    'https://docs.google.com/document/d/example-twp-note-1', 1),

(2, N'Họp Demo Progress Frontend & Thảo luận Luồng Review TWP',
    'https://meet.google.com/twp-team-weekly',
    DATEADD(DAY, 2, DATEADD(HOUR, 20, CAST(CAST(GETDATE() AS DATE) AS DATETIME2))),
    45,
    N'### Kế hoạch buổi họp tới:
- Demo Admin Dashboard & trang quản lý thành viên.
- Test luồng Back Log -> Processing -> Pending -> Reviewing -> Done.
- Kiểm tra cảnh báo quá hạn Đỏ và Vàng.',
    NULL, 2);
SET IDENTITY_INSERT meetings OFF;
GO

SET IDENTITY_INSERT meeting_logs ON;
INSERT INTO meeting_logs (id, logged_minutes, attendance_status, contribution_note, meeting_id, user_id) VALUES
(1, 60, 'PRESENT', N'Chủ trì cuộc họp, chốt phân công công việc.', 1, 1),
(2, 60, 'PRESENT', N'Báo cáo hoàn thành tài liệu SRS.',            1, 2),
(3, 60, 'PRESENT', N'Trình bày sơ đồ thiết kế CSDL MSSQL.',       1, 3),
(4, 55, 'PRESENT', N'Thống nhất cấu trúc JWT và phân quyền.',     1, 4),
(5, 0,  'EXCUSED', N'Xin phép vắng vì trùng lịch gia đình.',       1, 5);
SET IDENTITY_INSERT meeting_logs OFF;
GO

-- 4.6. Project Extensions
SET IDENTITY_INSERT project_extensions ON;
INSERT INTO project_extensions (id, category, item_name, version, description, reference_url, config_snippet) VALUES
(1, 'LANGUAGE', N'Java JDK 21 LTS', '21.0.2+',
    N'Phiên bản Java LTS bắt buộc cho Backend Spring Boot 3.',
    'https://adoptium.net/temurin/releases/?version=21',
    'java -version'),

(2, 'LANGUAGE', N'Node.js LTS & npm', '20.x',
    N'Môi trường thực thi JavaScript/React với Vite.',
    'https://nodejs.org/',
    'node -v' + CHAR(10) + 'npm -v'),

(3, 'IDE', N'IntelliJ IDEA Ultimate / Community', '2024.1+',
    N'IDE khuyến nghị cho phát triển Backend Spring Boot với đầy đủ hỗ trợ Spring Data JPA.',
    'https://www.jetbrains.com/idea/',
    NULL),

(4, 'IDE', N'Visual Studio Code', '1.90+',
    N'Editor tối ưu cho Frontend React + Tailwind CSS.',
    'https://code.visualstudio.com/',
    NULL),

(5, 'PLUGIN', N'Tailwind CSS IntelliSense', 'v0.10+',
    N'Extension VS Code hỗ trợ autocomplete class Tailwind CSS cực nhanh.',
    'https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss',
    NULL),

(6, 'ENV_CONFIG', N'Quy chuẩn đặt tên nhánh Git (Gitflow)', '1.0',
    N'Quy chuẩn đặt tên branch và commit message bắt buộc cho cả nhóm đồ án TWP.',
    'https://www.conventionalcommits.org/',
    'git checkout -b feature/ten-tinh-nang' + CHAR(10) + 'git checkout -b fix/ten-loi' + CHAR(10) + 'git commit -m "feat: them tinh nang review task"');
SET IDENTITY_INSERT project_extensions OFF;
GO

-- 4.7. Project Documents
SET IDENTITY_INSERT documents ON;
INSERT INTO documents (id, title, category, file_url, file_type, file_size_kb, uploaded_at, uploaded_by_user_id) VALUES
(1, N'Tài liệu Đặc tả Yêu cầu Phần mềm (SRS_v1.0.pdf)', 'SRS',
    '/uploads/documents/SRS_TeamWorkspacePortal_v1.0.pdf', 'application/pdf', 2450, DATEADD(DAY, -20, GETDATE()), 1),

(2, N'Sơ đồ Thiết kế Cơ sở Dữ liệu 3NF (ERD_Schema.png)', 'DATABASE',
    '/uploads/documents/ERD_TeamWorkspacePortal.png', 'image/png', 1120, DATEADD(DAY, -16, GETDATE()), 3),

(3, N'Bộ Test API Postman Collection (TeamWorkspacePortal_TWP.postman_collection.json)', 'ARCHITECTURE',
    '/uploads/documents/TeamWorkspacePortal.postman_collection.json', 'application/json', 156, DATEADD(DAY, -2, GETDATE()), 4);
SET IDENTITY_INSERT documents OFF;
GO

PRINT N'===========================================================';
PRINT N'DỮ LIỆU MẪU TEAM WORKSPACE PORTAL TWP ĐÃ SEED THÀNH CÔNG!';
PRINT N'===========================================================';
SELECT 'users' AS TableName, COUNT(*) AS TotalRows FROM users
UNION ALL SELECT 'phases', COUNT(*) FROM phases
UNION ALL SELECT 'tasks', COUNT(*) FROM tasks
UNION ALL SELECT 'schedule_entries', COUNT(*) FROM schedule_entries
UNION ALL SELECT 'meetings', COUNT(*) FROM meetings
UNION ALL SELECT 'meeting_logs', COUNT(*) FROM meeting_logs
UNION ALL SELECT 'project_extensions', COUNT(*) FROM project_extensions
UNION ALL SELECT 'documents', COUNT(*) FROM documents;
GO
