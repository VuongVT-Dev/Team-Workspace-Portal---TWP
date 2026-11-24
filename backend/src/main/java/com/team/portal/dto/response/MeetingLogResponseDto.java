package com.team.portal.dto.response;

import com.team.portal.entity.enums.AttendanceStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeetingLogResponseDto {
    private Long id;
    private UserDto user;
    private AttendanceStatus attendanceStatus;
    private Integer loggedMinutes;
    private String contributionNote;
}
