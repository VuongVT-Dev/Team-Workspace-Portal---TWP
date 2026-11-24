package com.team.portal.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AssignTaskRequest {
    private Long assigneeId; // null để unassign
}
