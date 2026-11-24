-- ====================================================================================
-- TEAM WORKSPACE PORTAL TWP - DATABASE INITIALIZATION SCRIPT FOR MSSQL
-- File này tạo Database và cấu trúc 8 bảng chuẩn cho hệ thống TWP.
-- Để nạp thêm dữ liệu mẫu đầy đủ, chạy file: database/seed_data.sql
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
