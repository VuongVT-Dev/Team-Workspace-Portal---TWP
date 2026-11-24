package com.team.portal.dto.request;

import com.team.portal.entity.enums.DayOfWeekCode;
import com.team.portal.entity.enums.ScheduleSlotType;
import com.team.portal.entity.enums.ShiftPeriod;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ToggleScheduleRequest {

    @NotNull(message = "Thứ trong tuần không được để trống")
    private DayOfWeekCode dayOfWeek;

    @NotNull(message = "Ca trong ngày không được để trống")
    private ShiftPeriod shift;

    @NotNull(message = "Loại lịch (CLASS hoặc LEAVE) không được để trống")
    private ScheduleSlotType type;

    private LocalDate specificDate;
    private String subjectOrReason;
}
