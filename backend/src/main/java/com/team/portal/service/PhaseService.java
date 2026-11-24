package com.team.portal.service;

import com.team.portal.dto.request.CreatePhaseRequest;
import com.team.portal.dto.response.PhaseResponseDto;
import com.team.portal.dto.response.UserDto;
import com.team.portal.entity.Phase;
import com.team.portal.entity.User;
import com.team.portal.entity.enums.Role;
import com.team.portal.entity.enums.TaskStatus;
import com.team.portal.exception.BadRequestException;
import com.team.portal.exception.ForbiddenException;
import com.team.portal.repository.PhaseRepository;
import com.team.portal.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PhaseService {

    private final PhaseRepository phaseRepository;
    private final TaskRepository taskRepository;
    private final AuthService authService;

    @Transactional(readOnly = true)
    public List<PhaseResponseDto> getAllPhasesWithProgress() {
        List<Phase> phases = phaseRepository.findAllByOrderByDisplayOrderAscStartDateAsc();
        return phases.stream().map(this::mapToDtoWithProgress).collect(Collectors.toList());
    }

    @Transactional
    public PhaseResponseDto createPhase(CreatePhaseRequest request) {
        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Chỉ tài khoản ADMIN mới có quyền thiết lập Phase mới!");
        }

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("Ngày kết thúc phải sau hoặc bằng ngày bắt đầu");
        }

        Phase phase = Phase.builder()
                .name(request.getName().trim())
                .description(request.getDescription())
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 1)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .createdBy(currentUser)
                .build();

        Phase saved = phaseRepository.save(phase);
        return mapToDtoWithProgress(saved);
    }

    public PhaseResponseDto mapToDtoWithProgress(Phase phase) {
        long totalTasks = taskRepository.countByPhaseId(phase.getId());
        long doneTasks = taskRepository.countByPhaseIdAndStatus(phase.getId(), TaskStatus.DONE);
        long reviewingTasks = taskRepository.countByPhaseIdAndStatus(phase.getId(), TaskStatus.REVIEWING);
        long overdueTasks = taskRepository.countOverdueByPhaseId(phase.getId(), LocalDate.now(), TaskStatus.DONE);

        // Thanh tiến độ Phase nhảy % khi task đạt trạng thái DONE
        int progressPercentage = totalTasks > 0
                ? (int) Math.round(((double) doneTasks / totalTasks) * 100)
                : 0;

        return PhaseResponseDto.builder()
                .id(phase.getId())
                .name(phase.getName())
                .description(phase.getDescription())
                .displayOrder(phase.getDisplayOrder())
                .startDate(phase.getStartDate())
                .endDate(phase.getEndDate())
                .totalTasks(totalTasks)
                .doneTasks(doneTasks)
                .reviewingTasks(reviewingTasks)
                .overdueTasks(overdueTasks)
                .progressPercentage(progressPercentage)
                .createdBy(UserDto.fromEntity(phase.getCreatedBy()))
                .build();
    }
}
