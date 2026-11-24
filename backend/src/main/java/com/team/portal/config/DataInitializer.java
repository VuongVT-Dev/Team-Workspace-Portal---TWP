package com.team.portal.config;

import com.team.portal.entity.*;
import com.team.portal.entity.enums.*;
import com.team.portal.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PhaseRepository phaseRepository;
    private final TaskRepository taskRepository;
    private final ProjectExtensionRepository extensionRepository;
    private final ScheduleEntryRepository scheduleRepository;
    private final MeetingRepository meetingRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            log.info("Starting DataInitializer: Seeding initial data for Team Workspace Portal TWP...");
            seedUsersAndData();
            log.info("DataInitializer completed successfully!");
        }
    }

    private void seedUsersAndData() {
        // 1. Seed 5 Users (1 Admin, 1 Team Leader, 1 Co-Leader, 2 Normal Members)
        User admin = User.builder()
                .username("admin")
                .passwordHash(passwordEncoder.encode("admin123"))
                .fullName("Trần Minh Quân (Admin)")
                .email("quan.tm@fpt.edu.vn")
                .studentCode("SE160001")
                .avatarUrl("https://api.dicebear.com/7.x/bottts/svg?seed=admin")
                .role(Role.ADMIN)
                .teamRole(TeamRole.TEAM_LEADER)
                .build();

        User member1 = User.builder()
                .username("member1")
                .passwordHash(passwordEncoder.encode("member123"))
                .fullName("Lê Thu Hà")
                .email("ha.lt@fpt.edu.vn")
                .studentCode("SE160002")
                .avatarUrl("https://api.dicebear.com/7.x/bottts/svg?seed=member1")
                .role(Role.MEMBER)
                .teamRole(TeamRole.TEAM_LEADER)
                .build();

        User member2 = User.builder()
                .username("member2")
                .passwordHash(passwordEncoder.encode("member123"))
                .fullName("Nguyễn Văn Hùng")
                .email("hung.nv@fpt.edu.vn")
                .studentCode("SE160003")
                .avatarUrl("https://api.dicebear.com/7.x/bottts/svg?seed=member2")
                .role(Role.MEMBER)
                .teamRole(TeamRole.CO_LEADER)
                .build();

        User member3 = User.builder()
                .username("member3")
                .passwordHash(passwordEncoder.encode("member123"))
                .fullName("Phạm Đức Thắng")
                .email("thang.pd@fpt.edu.vn")
                .studentCode("SE160004")
                .avatarUrl("https://api.dicebear.com/7.x/bottts/svg?seed=member3")
                .role(Role.MEMBER)
                .teamRole(TeamRole.MEMBER)
                .build();

        User member4 = User.builder()
                .username("member4")
                .passwordHash(passwordEncoder.encode("member123"))
                .fullName("Vũ Hải Yến")
                .email("yen.vh@fpt.edu.vn")
                .studentCode("SE160005")
                .avatarUrl("https://api.dicebear.com/7.x/bottts/svg?seed=member4")
                .role(Role.MEMBER)
                .teamRole(TeamRole.MEMBER)
                .build();

        userRepository.saveAll(List.of(admin, member1, member2, member3, member4));

        // 2. Seed 3 Phases
        LocalDate today = LocalDate.now();
        Phase phase1 = Phase.builder()
                .name("Giai đoạn 1: Khảo sát & Phân tích yêu cầu (SRS)")
                .description("Thu thập đặc tả hệ thống, phân tích bài toán, xác định các ràng buộc và thiết kế sơ đồ CSDL quan hệ.")
                .displayOrder(1)
                .startDate(today.minusDays(30))
                .endDate(today.minusDays(15))
                .createdBy(admin)
                .build();

        Phase phase2 = Phase.builder()
                .name("Giai đoạn 2: Hiện thực Backend & Frontend Core")
                .description("Phát triển REST API với Spring Boot 3 & MSSQL, giao diện React Vite Tailwind, cơ chế phân quyền và review.")
                .displayOrder(2)
                .startDate(today.minusDays(14))
                .endDate(today.plusDays(15))
                .createdBy(admin)
                .build();

        Phase phase3 = Phase.builder()
                .name("Giai đoạn 3: Kiểm thử, Tối ưu & Viết báo cáo tốt nghiệp")
                .description("Kiểm thử Postman API, tối ưu hiệu năng CSDL, đóng gói Docker và chuẩn bị Slide thuyết trình.")
                .displayOrder(3)
                .startDate(today.plusDays(16))
                .endDate(today.plusDays(40))
                .createdBy(admin)
                .build();

        phaseRepository.saveAll(List.of(phase1, phase2, phase3));

        // 3. Seed Sample Tasks (Covering all 5 statuses + RED/YELLOW overdue warnings)
        Task task1 = Task.builder()
                .taskCode("TWP-001")
                .title("Khảo sát nghiệp vụ và viết tài liệu SRS v1.0")
                .taskType(TaskType.DOC)
                .difficulty(TaskDifficulty.EASY)
                .status(TaskStatus.DONE)
                .description("Viết đặc tả Use Case, phân quyền Admin/Member và luồng xử lý Task.")
                .note("Tuân thủ mẫu tài liệu đồ án của khoa.")
                .startDate(today.minusDays(28))
                .endDate(today.minusDays(22))
                .workSubmissionNote("Đã hoàn thành file SRS tại thư mục docs nhóm.")
                .reviewComment("Tài liệu đầy đủ, định dạng tốt. Duyệt đạt!")
                .reviewedAt(LocalDateTime.now().minusDays(21))
                .phase(phase1)
                .assigner(admin)
                .assignee(member1)
                .build();

        Task task2 = Task.builder()
                .taskCode("TWP-002")
                .title("Vẽ sơ đồ ERD & Thiết kế CSDL quan hệ trên MS SQL Server")
                .taskType(TaskType.DRAW)
                .difficulty(TaskDifficulty.MEDIUM)
                .status(TaskStatus.DONE)
                .description("Thiết kế sơ đồ thực thể kết hợp (ERD) chuẩn hóa 3NF cho 8 bảng hệ thống.")
                .note("Đảm bảo Privacy-First trên bảng users.")
                .startDate(today.minusDays(21))
                .endDate(today.minusDays(16))
                .workSubmissionNote("ERD 8 bảng chuẩn hóa 3NF, script DDL sẵn sàng.")
                .reviewComment("Kiến trúc bảng rất chuẩn, đặc biệt bảng schedule_entries tối ưu.")
                .reviewedAt(LocalDateTime.now().minusDays(15))
                .phase(phase1)
                .assigner(admin)
                .assignee(member2)
                .build();

        Task task3 = Task.builder()
                .taskCode("TWP-003")
                .title("Cấu hình Spring Boot 3, Spring Security & JWT Token")
                .taskType(TaskType.CODE)
                .difficulty(TaskDifficulty.MEDIUM)
                .status(TaskStatus.REVIEWING)
                .description("Triển khai xác thực JWT, phân quyền ADMIN, TEAM_LEADER, CO_LEADER và MEMBER.")
                .note("Cần kiểm tra kỹ lỗi 403 Forbidden khi member thường gọi API bị chặn.")
                .startDate(today.minusDays(12))
                .endDate(today.minusDays(2)) // Quá hạn nhưng ở REVIEWING -> Warning VÀNG
                .workSubmissionNote("Đã push code nhánh feature/auth-jwt lên repo. Xin trưởng nhóm review.")
                .phase(phase2)
                .assigner(admin)
                .assignee(member3)
                .build();

        Task task4 = Task.builder()
                .taskCode("TWP-004")
                .title("Xây dựng giao diện Workspace & Kanban Board (React + Tailwind)")
                .taskType(TaskType.CODE)
                .difficulty(TaskDifficulty.HARD)
                .status(TaskStatus.PROCESSING)
                .description("Phát triển màn hình Workspace 5 cột trạng thái và cảnh báo quá hạn.")
                .note("Hiển thị badge cảnh báo đỏ/vàng rõ ràng.")
                .startDate(today.minusDays(10))
                .endDate(today.minusDays(1)) // Quá hạn và đang PROCESSING -> Warning ĐỎ
                .phase(phase2)
                .assigner(member1)
                .assignee(member4)
                .build();

        Task task5 = Task.builder()
                .taskCode("TWP-005")
                .title("Phân tích & Lập trình thuật toán tìm giờ rảnh chung từ Timetable")
                .taskType(TaskType.ANALYST)
                .difficulty(TaskDifficulty.MEDIUM)
                .status(TaskStatus.PENDING)
                .description("Tổng hợp lịch học từ bảng schedule_entries và lọc ra các ca rảnh của cả nhóm.")
                .note("Kiểm tra trường hợp trùng ngày nghỉ phép.")
                .startDate(today.minusDays(8))
                .endDate(today.minusDays(1)) // Quá hạn nhưng đã PENDING -> Warning VÀNG
                .workSubmissionNote("Đã hoàn thiện thuật toán và unit test, xin Leader vào review.")
                .phase(phase2)
                .assigner(admin)
                .assignee(member2)
                .build();

        Task task6 = Task.builder()
                .taskCode("TWP-006")
                .title("Viết bộ Test Cases & Kiểm thử API bằng Postman")
                .taskType(TaskType.TEST)
                .difficulty(TaskDifficulty.MEDIUM)
                .status(TaskStatus.BACKLOG)
                .description("Kiểm thử tất cả endpoint Auth, Task, Phase, Schedule và phân quyền.")
                .note("Chưa chỉ định người làm — thành viên có thể bấm Nhận Task.")
                .startDate(today)
                .endDate(today.plusDays(10))
                .phase(phase2)
                .assigner(member2)
                .assignee(null) // Chưa ai nhận -> hiển thị nút Nhận Task
                .build();

        Task task7 = Task.builder()
                .taskCode("TWP-007")
                .title("Thiết kế Slide thuyết trình đồ án tốt nghiệp cuối kỳ")
                .taskType(TaskType.SLIDE)
                .difficulty(TaskDifficulty.MEDIUM)
                .status(TaskStatus.BACKLOG)
                .description("Chuẩn bị slide demo hệ thống Team Workspace Portal TWP cho hội đồng.")
                .note("Dự kiến 20-25 slide.")
                .startDate(today.plusDays(20))
                .endDate(today.plusDays(35))
                .phase(phase3)
                .assigner(admin)
                .assignee(null)
                .build();

        taskRepository.saveAll(List.of(task1, task2, task3, task4, task5, task6, task7));

        // 4. Seed Schedule entries
        ScheduleEntry s1 = ScheduleEntry.builder()
                .user(admin)
                .dayOfWeek(DayOfWeekCode.MON)
                .shift(ShiftPeriod.MORNING_1)
                .type(ScheduleSlotType.CLASS)
                .subjectOrReason("Môn Đồ Án Tốt Nghiệp")
                .build();

        ScheduleEntry s2 = ScheduleEntry.builder()
                .user(member1)
                .dayOfWeek(DayOfWeekCode.MON)
                .shift(ShiftPeriod.MORNING_1)
                .type(ScheduleSlotType.CLASS)
                .subjectOrReason("Học Tiếng Anh Chuyên Ngành")
                .build();

        ScheduleEntry s3 = ScheduleEntry.builder()
                .user(member2)
                .dayOfWeek(DayOfWeekCode.WED)
                .shift(ShiftPeriod.AFTERNOON_1)
                .type(ScheduleSlotType.LEAVE)
                .subjectOrReason("Bận việc gia đình")
                .build();

        scheduleRepository.saveAll(List.of(s1, s2, s3));

        // 5. Seed Meeting
        Meeting m1 = Meeting.builder()
                .title("Họp Sprint Review & Phân công Task Giai đoạn 2")
                .googleMeetLink("https://meet.google.com/abc-xyz-twp")
                .startTime(LocalDateTime.now().plusDays(1).withHour(19).withMinute(30))
                .durationMinutes(60)
                .takeNoteContent("### Nội dung buổi họp:\n1. Đánh giá tiến độ SRS Giai đoạn 1.\n2. Phân công task dựng giao diện Frontend.\n3. Thống nhất quy chuẩn Git Commit: `feat:`, `fix:`, `docs:`.")
                .createdBy(admin)
                .build();
        meetingRepository.save(m1);

        // 6. Seed Project Extensions
        ProjectExtension ext1 = ProjectExtension.builder()
                .category("LANGUAGE")
                .itemName("Java JDK 21 LTS")
                .version("21.0.2")
                .description("Phiên bản Java LTS bắt buộc cho Backend Spring Boot 3.")
                .referenceUrl("https://adoptium.net/temurin/releases/?version=21")
                .configSnippet("java -version")
                .build();

        ProjectExtension ext2 = ProjectExtension.builder()
                .category("LANGUAGE")
                .itemName("Node.js LTS")
                .version("20.x")
                .description("Môi trường thực thi JavaScript/React với Vite.")
                .referenceUrl("https://nodejs.org/")
                .configSnippet("node -v\nnpm -v")
                .build();

        ProjectExtension ext3 = ProjectExtension.builder()
                .category("IDE")
                .itemName("IntelliJ IDEA")
                .version("2024.1+")
                .description("IDE khuyến nghị cho phát triển Backend Spring Boot với đầy đủ hỗ trợ Spring Data JPA & Database Tools.")
                .referenceUrl("https://www.jetbrains.com/idea/")
                .configSnippet(null)
                .build();

        ProjectExtension ext4 = ProjectExtension.builder()
                .category("PLUGIN")
                .itemName("Tailwind CSS IntelliSense")
                .version("v0.10+")
                .description("Extension VS Code hỗ trợ autocomplete class Tailwind CSS cực nhanh.")
                .referenceUrl("https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss")
                .configSnippet(null)
                .build();

        ProjectExtension ext5 = ProjectExtension.builder()
                .category("ENV_CONFIG")
                .itemName("Quy chuẩn đặt tên nhánh Git (Gitflow)")
                .version("1.0")
                .description("Quy chuẩn đặt tên branch và commit message cho cả nhóm.")
                .referenceUrl("https://www.conventionalcommits.org/")
                .configSnippet("git checkout -b feature/ten-tinh-nang\ngit checkout -b fix/ten-loi\ngit commit -m \"feat: them tinh nang review task\"")
                .build();

        extensionRepository.saveAll(List.of(ext1, ext2, ext3, ext4, ext5));
    }
}
