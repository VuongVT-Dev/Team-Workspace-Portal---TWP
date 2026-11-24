package com.team.portal.service;

import com.team.portal.dto.request.*;
import com.team.portal.dto.response.TaskResponseDto;
import com.team.portal.entity.Phase;
import com.team.portal.entity.Task;
import com.team.portal.entity.User;
import com.team.portal.entity.enums.TaskDifficulty;
import com.team.portal.entity.enums.TaskStatus;
import com.team.portal.exception.BadRequestException;
import com.team.portal.exception.ForbiddenException;
import com.team.portal.exception.ResourceNotFoundException;
import com.team.portal.repository.PhaseRepository;
import com.team.portal.repository.TaskRepository;
import com.team.portal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final PhaseRepository phaseRepository;
    private final UserRepository userRepository;
    private final AuthService authService;

    @Transactional(readOnly = true)
    public List<TaskResponseDto> getMyTasks() {
        User currentUser = authService.getCurrentUser();
        return taskRepository.findByAssigneeId(currentUser.getId()).stream()
                .map(TaskResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TaskResponseDto> getAllTasks(Long phaseId, TaskStatus status) {
        List<Task> tasks;
        if (phaseId != null && status != null) {
            tasks = taskRepository.findByPhaseId(phaseId).stream()
                    .filter(t -> t.getStatus() == status)
                    .collect(Collectors.toList());
        } else if (phaseId != null) {
            tasks = taskRepository.findByPhaseId(phaseId);
        } else if (status != null) {
            tasks = taskRepository.findByStatus(status);
        } else {
            tasks = taskRepository.findAllWithDetails();
        }
        return tasks.stream().map(TaskResponseDto::fromEntity).collect(Collectors.toList());
    }

    @Transactional
    public TaskResponseDto createTask(CreateTaskRequest request) {
        User currentUser = authService.getCurrentUser();

        // Chỉ ADMIN, TEAM_LEADER hoặc CO_LEADER mới có quyền tạo task
        if (!currentUser.canCreateTask()) {
            throw new ForbiddenException("Quyền từ chối: Member bình thường không thể tạo Task! Chỉ Admin, Team Leader hoặc Co-Leader mới có quyền tạo Task.");
        }

        Phase phase = phaseRepository.findById(request.getPhaseId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Phase với ID: " + request.getPhaseId()));

        User assignee = null;
        if (request.getAssigneeId() != null) {
            assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thành viên được giao với ID: " + request.getAssigneeId()));
        }

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("Ngày kết thúc không được sớm hơn ngày bắt đầu");
        }

        String customCode = (request.getTaskCode() != null && !request.getTaskCode().isBlank())
                ? request.getTaskCode().trim().toUpperCase()
                : null;
        if (customCode != null && taskRepository.existsByTaskCode(customCode)) {
            throw new BadRequestException("Mã Task '" + customCode + "' đã tồn tại!");
        }

        // Khi vừa tạo -> luôn bắt đầu ở trạng thái BACKLOG
        Task task = Task.builder()
                .taskCode(customCode)
                .title(request.getTitle().trim())
                .taskType(request.getTaskType())
                .difficulty(request.getDifficulty() != null ? request.getDifficulty() : TaskDifficulty.MEDIUM)
                .status(TaskStatus.BACKLOG)
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .attachmentUrl(request.getAttachmentUrl() != null && !request.getAttachmentUrl().isBlank()
                        ? request.getAttachmentUrl().trim() : null)
                .attachmentName(request.getAttachmentName() != null && !request.getAttachmentName().isBlank()
                        ? request.getAttachmentName().trim() : null)
                .note(request.getNote() != null ? request.getNote().trim() : null)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .phase(phase)
                .assigner(currentUser)
                .assignee(assignee)
                .build();

        Task saved = taskRepository.save(task);
        if (saved.getTaskCode() == null || saved.getTaskCode().isBlank()) {
            String generatedCode = String.format("TWP-%03d", saved.getId());
            if (taskRepository.existsByTaskCode(generatedCode)) {
                generatedCode = "TWP-" + saved.getId() + "-" + (System.currentTimeMillis() % 1000);
            }
            saved.setTaskCode(generatedCode);
            saved = taskRepository.save(saved);
        }
        return TaskResponseDto.fromEntity(saved);
    }

    @Transactional
    public TaskResponseDto updateTaskStatus(Long taskId, UpdateTaskStatusRequest request) {
        User currentUser = authService.getCurrentUser();
        Task task = getTaskById(taskId);
        TaskStatus targetStatus = request.getStatus();

        boolean isAssigner = task.getAssigner() != null && task.getAssigner().getId().equals(currentUser.getId());
        boolean isAssignee = task.getAssignee() != null && task.getAssignee().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.isAdmin();

        // 1. Trạng thái REVIEWING: chỉ role chủ chốt (Admin / Team Leader / Co-Leader) và là người tạo task hoặc Admin
        if (targetStatus == TaskStatus.REVIEWING) {
            if (!currentUser.isKeyRole() || (!isAssigner && !isAdmin)) {
                throw new ForbiddenException("Quyền từ chối: Member bình thường không thể đưa trạng thái về Reviewing! Chỉ người tạo task hoặc vai trò chủ chốt mới có quyền.");
            }
        }

        // 2. Trạng thái DONE: chỉ người tạo task (Assigner) mới có quyền duyệt hoàn thành
        if (targetStatus == TaskStatus.DONE) {
            if (!isAssigner) {
                throw new ForbiddenException("Quyền từ chối: Chỉ người tạo task (" + task.getAssigner().getFullName() + ") mới có quyền duyệt trạng thái DONE!");
            }
            task.setReviewedAt(LocalDateTime.now());
        }

        // 3. Nếu task đã DONE, member thường không thể tự kéo ngược trạng thái
        if (task.getStatus() == TaskStatus.DONE && targetStatus != TaskStatus.DONE && !isAssigner && !isAdmin) {
            throw new ForbiddenException("Task đã hoàn thành (DONE). Chỉ người tạo task hoặc Admin mới có thể mở lại!");
        }

        // 4. Các trạng thái BACKLOG / PROCESSING / PENDING: thành viên nhận task, người tạo task hoặc Admin
        if (targetStatus == TaskStatus.PROCESSING || targetStatus == TaskStatus.PENDING || targetStatus == TaskStatus.BACKLOG) {
            if (task.getAssignee() == null && targetStatus == TaskStatus.PROCESSING) {
                // Nếu task chưa ai nhận mà member bấm chuyển sang Processing -> tự động nhận task
                task.setAssignee(currentUser);
            } else if (!isAssignee && !isAssigner && !isAdmin) {
                throw new ForbiddenException("Bạn chỉ có thể thay đổi trạng thái công việc được giao cho mình!");
            }
        }

        task.setStatus(targetStatus);
        Task updated = taskRepository.save(task);
        return TaskResponseDto.fromEntity(updated);
    }

    @Transactional
    public TaskResponseDto assignTask(Long taskId, AssignTaskRequest request) {
        User currentUser = authService.getCurrentUser();
        Task task = getTaskById(taskId);

        boolean isAssigner = task.getAssigner() != null && task.getAssigner().getId().equals(currentUser.getId());
        if (!currentUser.isAdmin() && !isAssigner) {
            throw new ForbiddenException("Chỉ Admin hoặc người tạo task mới có quyền chỉ định người nhận task!");
        }

        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thành viên với ID: " + request.getAssigneeId()));
            task.setAssignee(assignee);
        } else {
            task.setAssignee(null);
            task.setStatus(TaskStatus.BACKLOG);
        }
        Task updated = taskRepository.save(task);
        return TaskResponseDto.fromEntity(updated);
    }

    @Transactional
    public TaskResponseDto claimTask(Long taskId) {
        User currentUser = authService.getCurrentUser();
        Task task = getTaskById(taskId);

        if (task.getAssignee() != null) {
            throw new BadRequestException("Task này đã có người nhận (" + task.getAssignee().getFullName() + ")!");
        }

        // Nhận task -> trở thành người nhận task (vẫn giữ ở Backlog để thành viên chủ động bấm Processing)
        task.setAssignee(currentUser);
        Task updated = taskRepository.save(task);
        return TaskResponseDto.fromEntity(updated);
    }

    @Transactional
    public TaskResponseDto submitWork(Long taskId, SubmitWorkRequest request) {
        User currentUser = authService.getCurrentUser();
        Task task = getTaskById(taskId);

        // Kiểm tra người nộp phải là Assignee, Assigner hoặc Admin
        if (task.getAssignee() != null
                && !task.getAssignee().getId().equals(currentUser.getId())
                && !task.getAssigner().getId().equals(currentUser.getId())
                && !currentUser.isAdmin()) {
            throw new ForbiddenException("Chỉ người được giao việc mới có quyền nộp kết quả công việc!");
        }

        task.setWorkSubmissionNote(request.getWorkSubmissionNote().trim());
        if (request.getAttachmentUrl() != null && !request.getAttachmentUrl().isBlank()) {
            task.setAttachmentUrl(request.getAttachmentUrl().trim());
            if (request.getAttachmentName() != null && !request.getAttachmentName().isBlank()) {
                task.setAttachmentName(request.getAttachmentName().trim());
            }
        }
        // Thành viên hoàn thành task -> chuyển trạng thái sang PENDING để người tạo task review
        task.setStatus(TaskStatus.PENDING);
        Task updated = taskRepository.save(task);
        return TaskResponseDto.fromEntity(updated);
    }

    @Transactional
    public TaskResponseDto startReview(Long taskId) {
        User currentUser = authService.getCurrentUser();
        Task task = getTaskById(taskId);

        boolean isAssigner = task.getAssigner() != null && task.getAssigner().getId().equals(currentUser.getId());
        if (!currentUser.isKeyRole() || (!isAssigner && !currentUser.isAdmin())) {
            throw new ForbiddenException("Quyền từ chối: Chỉ người tạo task hoặc vai trò chủ chốt mới có thể đưa trạng thái về Reviewing!");
        }

        task.setStatus(TaskStatus.REVIEWING);
        Task updated = taskRepository.save(task);
        return TaskResponseDto.fromEntity(updated);
    }

    @Transactional
    public TaskResponseDto reviewTask(Long taskId, ReviewTaskRequest request) {
        User currentUser = authService.getCurrentUser();
        Task task = getTaskById(taskId);

        // HARD CONSTRAINT: Bắt buộc kiểm tra currentUser.id == task.assigner.id
        if (!task.getAssigner().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("Quyền từ chối: Chỉ người tạo/giao việc (" + task.getAssigner().getFullName()
                    + ") mới có quyền nhận xét và duyệt hoàn thành task này!");
        }

        if (request.getStatus() != TaskStatus.DONE
                && request.getStatus() != TaskStatus.PROCESSING
                && request.getStatus() != TaskStatus.REVIEWING) {
            throw new BadRequestException("Quyết định review chỉ có thể là REVIEWING, DONE (Duyệt) hoặc PROCESSING (Yêu cầu sửa lại)");
        }

        task.setReviewComment(request.getReviewComment().trim());
        task.setStatus(request.getStatus());
        task.setReviewedAt(LocalDateTime.now());

        Task updated = taskRepository.save(task);
        return TaskResponseDto.fromEntity(updated);
    }

    @Transactional
    public void deleteTask(Long taskId) {
        User currentUser = authService.getCurrentUser();
        Task task = getTaskById(taskId);
        boolean isAssigner = task.getAssigner() != null && task.getAssigner().getId().equals(currentUser.getId());
        if (!currentUser.isAdmin() && !isAssigner) {
            throw new ForbiddenException("Chỉ Admin hoặc người tạo task mới có quyền xóa task!");
        }
        taskRepository.delete(task);
    }

    private Task getTaskById(Long taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy task với ID: " + taskId));
    }
}
