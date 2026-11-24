package com.team.portal.service;

import com.team.portal.dto.response.AdminDashboardDto;
import com.team.portal.dto.response.PhaseResponseDto;
import com.team.portal.dto.response.TaskResponseDto;
import com.team.portal.dto.response.UserDto;
import com.team.portal.entity.Task;
import com.team.portal.entity.User;
import com.team.portal.entity.enums.TaskStatus;
import com.team.portal.exception.ForbiddenException;
import com.team.portal.repository.TaskRepository;
import com.team.portal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final PhaseService phaseService;

    @Transactional(readOnly = true)
    public AdminDashboardDto getDashboard() {
        User currentUser = authService.getCurrentUser();
        if (!currentUser.isAdmin()) {
            throw new ForbiddenException("Chỉ tài khoản ADMIN mới có quyền truy cập Admin Dashboard!");
        }

        List<User> allUsers = userRepository.findAll();
        List<PhaseResponseDto> phases = phaseService.getAllPhasesWithProgress();
        List<Task> allTasks = taskRepository.findAllWithDetails();
        List<TaskResponseDto> taskDtos = allTasks.stream()
                .map(TaskResponseDto::fromEntity)
                .collect(Collectors.toList());

        long totalTasks = taskDtos.size();
        long backlog = countByStatus(taskDtos, TaskStatus.BACKLOG);
        long processing = countByStatus(taskDtos, TaskStatus.PROCESSING);
        long pending = countByStatus(taskDtos, TaskStatus.PENDING);
        long reviewing = countByStatus(taskDtos, TaskStatus.REVIEWING);
        long done = countByStatus(taskDtos, TaskStatus.DONE);

        long overdueRed = taskDtos.stream().filter(t -> "RED".equals(t.getWarningLevel())).count();
        long overdueYellow = taskDtos.stream().filter(t -> "YELLOW".equals(t.getWarningLevel())).count();

        int overallProgress = totalTasks > 0
                ? (int) Math.round(((double) done / totalTasks) * 100)
                : 0;

        Map<String, Long> tasksByStatus = new LinkedHashMap<>();
        tasksByStatus.put("BACKLOG", backlog);
        tasksByStatus.put("PROCESSING", processing);
        tasksByStatus.put("PENDING", pending);
        tasksByStatus.put("REVIEWING", reviewing);
        tasksByStatus.put("DONE", done);

        List<AdminDashboardDto.MemberWorkloadDto> memberWorkloads = allUsers.stream()
                .map(u -> {
                    List<TaskResponseDto> userTasks = taskDtos.stream()
                            .filter(t -> t.getAssignee() != null && t.getAssignee().getId().equals(u.getId()))
                            .collect(Collectors.toList());

                    return AdminDashboardDto.MemberWorkloadDto.builder()
                            .user(UserDto.fromEntity(u))
                            .totalAssigned(userTasks.size())
                            .backlogCount(countByStatus(userTasks, TaskStatus.BACKLOG))
                            .processingCount(countByStatus(userTasks, TaskStatus.PROCESSING))
                            .pendingCount(countByStatus(userTasks, TaskStatus.PENDING))
                            .reviewingCount(countByStatus(userTasks, TaskStatus.REVIEWING))
                            .doneCount(countByStatus(userTasks, TaskStatus.DONE))
                            .overdueCount(userTasks.stream().filter(TaskResponseDto::isOverdue).count())
                            .build();
                })
                .collect(Collectors.toList());

        List<TaskResponseDto> warningTasks = taskDtos.stream()
                .filter(TaskResponseDto::isOverdue)
                .sorted(Comparator.comparing((TaskResponseDto t) -> "RED".equals(t.getWarningLevel()) ? 0 : 1)
                        .thenComparing(TaskResponseDto::getEndDate))
                .collect(Collectors.toList());

        List<TaskResponseDto> recentTasks = taskDtos.stream()
                .limit(15)
                .collect(Collectors.toList());

        return AdminDashboardDto.builder()
                .totalMembers(allUsers.size())
                .totalPhases(phases.size())
                .totalTasks(totalTasks)
                .doneTasks(done)
                .pendingReviewTasks(pending + reviewing)
                .processingTasks(processing)
                .backlogTasks(backlog)
                .overdueRedTasks(overdueRed)
                .overdueYellowTasks(overdueYellow)
                .overallProgressPercentage(overallProgress)
                .tasksByStatus(tasksByStatus)
                .phases(phases)
                .memberWorkloads(memberWorkloads)
                .warningTasks(warningTasks)
                .recentTasks(recentTasks)
                .build();
    }

    private long countByStatus(List<TaskResponseDto> tasks, TaskStatus status) {
        return tasks.stream().filter(t -> t.getStatus() == status).count();
    }
}
