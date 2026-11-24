package com.team.portal.dto.response;

import com.team.portal.entity.enums.DayOfWeekCode;
import com.team.portal.entity.enums.ShiftPeriod;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleSlotDto {
    private DayOfWeekCode dayOfWeek;
    private ShiftPeriod shift;
    private String timeRange;
    @Builder.Default
    private List<BusyMemberDto> busyMembers = new ArrayList<>();
    private boolean isAllFree;
}
