package com.team.portal.dto.request;

import com.team.portal.entity.enums.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReviewTaskRequest {

    @NotBlank(message = "Nhận xét review không được để trống")
    private String reviewComment;

    @NotNull(message = "Kết quả duyệt (REVIEWING, DONE hoặc PROCESSING) không được để trống")
    private TaskStatus status; // Chấp nhận REVIEWING, DONE hoặc PROCESSING
}
