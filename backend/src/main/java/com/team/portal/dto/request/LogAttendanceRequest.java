package com.team.portal.dto.request;

import com.team.portal.entity.enums.AttendanceStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LogAttendanceRequest {

    @NotNull(message = "User ID không được để trống")
    private Long userId;

    @NotNull(message = "Trạng thái điểm danh không được để trống")
    private AttendanceStatus attendanceStatus;

    @NotNull(message = "Số phút tham gia không được để trống")
    @Min(value = 0, message = "Số phút tham gia không được âm")
    private Integer loggedMinutes;

    private String contributionNote;
}
