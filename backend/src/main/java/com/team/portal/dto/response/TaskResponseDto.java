package com.team.portal.dto.response;

import com.team.portal.entity.Task;
import com.team.portal.entity.enums.TaskDifficulty;
import com.team.portal.entity.enums.TaskStatus;
import com.team.portal.entity.enums.TaskType;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskResponseDto {
    private Long id;
    private String taskCode;
    private String title;
    private TaskType taskType;
    private TaskDifficulty difficulty;
    private TaskStatus status;
    private String description;
    private String attachmentUrl;
    private String attachmentName;
    private String note;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean isOverdue;
    /**
     * NONE: đúng hạn hoặc đã DONE
     * YELLOW: quá hạn nhưng đang ở PENDING hoặc REVIEWING
     * RED: quá hạn và đang ở BACKLOG hoặc PROCESSING
     */
    private String warningLevel;
    private String workSubmissionNote;
    private String reviewComment;
    private LocalDateTime reviewedAt;
    private Long phaseId;
    private String phaseName;
    private UserDto assigner;
    private UserDto assignee;

    public static TaskResponseDto fromEntity(Task task) {
        if (task == null) return null;

        boolean overdue = task.getEndDate() != null
                && task.getEndDate().isBefore(LocalDate.now())
                && task.getStatus() != TaskStatus.DONE;

        String warning = "NONE";
        if (overdue) {
            if (task.getStatus() == TaskStatus.PENDING || task.getStatus() == TaskStatus.REVIEWING) {
                warning = "YELLOW";
            } else {
                warning = "RED";
            }
        }

        String code = (task.getTaskCode() != null && !task.getTaskCode().isBlank())
                ? task.getTaskCode()
                : String.format("TWP-%03d", task.getId());

        return TaskResponseDto.builder()
                .id(task.getId())
                .taskCode(code)
                .title(task.getTitle())
                .taskType(task.getTaskType())
                .difficulty(task.getDifficulty())
                .status(task.getStatus())
                .description(task.getDescription())
                .attachmentUrl(task.getAttachmentUrl())
                .attachmentName(task.getAttachmentName())
                .note(task.getNote())
                .startDate(task.getStartDate())
                .endDate(task.getEndDate())
                .isOverdue(overdue)
                .warningLevel(warning)
                .workSubmissionNote(task.getWorkSubmissionNote())
                .reviewComment(task.getReviewComment())
                .reviewedAt(task.getReviewedAt())
                .phaseId(task.getPhase() != null ? task.getPhase().getId() : null)
                .phaseName(task.getPhase() != null ? task.getPhase().getName() : null)
                .assigner(UserDto.fromEntity(task.getAssigner()))
                .assignee(UserDto.fromEntity(task.getAssignee()))
                .build();
    }
}
