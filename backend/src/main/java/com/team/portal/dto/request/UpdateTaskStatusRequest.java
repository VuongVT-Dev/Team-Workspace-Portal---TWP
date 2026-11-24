package com.team.portal.dto.request;

import com.team.portal.entity.enums.TaskStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTaskStatusRequest {

    @NotNull(message = "Trạng thái công việc không được để trống")
    private TaskStatus status;
}
