package com.team.portal.dto.response;

import com.team.portal.entity.enums.ScheduleSlotType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusyMemberDto {
    private Long userId;
    private String fullName;
    private String avatarUrl;
    private ScheduleSlotType type;
    private String subjectOrReason;
}
