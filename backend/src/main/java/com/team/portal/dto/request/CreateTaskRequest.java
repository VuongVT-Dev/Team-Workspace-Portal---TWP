package com.team.portal.dto.request;

import com.team.portal.entity.enums.TaskDifficulty;
import com.team.portal.entity.enums.TaskType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateTaskRequest {

    private String taskCode; // Tùy chọn: nếu để trống hệ thống tự sinh TWP-XXX

    @NotBlank(message = "Tên công việc không được để trống")
    private String title;

    @NotNull(message = "Loại công việc không được để trống")
    private TaskType taskType;

    private TaskDifficulty difficulty = TaskDifficulty.MEDIUM;

    private String description;

    private String attachmentUrl;

    private String attachmentName;

    private String note;

    @NotNull(message = "Phase ID không được để trống")
    private Long phaseId;

    private Long assigneeId; // Có thể null để thành viên tự chọn nhận task

    @NotNull(message = "Ngày bắt đầu không được để trống")
    private LocalDate startDate;

    @NotNull(message = "Ngày kết thúc không được để trống")
    private LocalDate endDate;
}
