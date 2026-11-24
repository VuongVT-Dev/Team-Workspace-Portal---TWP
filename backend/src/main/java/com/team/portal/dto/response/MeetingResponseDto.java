package com.team.portal.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeetingResponseDto {
    private Long id;
    private String title;
    private String googleMeetLink;
    private LocalDateTime startTime;
    private Integer durationMinutes;
    private String takeNoteContent;
    private String noteDocUrl;
    private UserDto createdBy;
    @Builder.Default
    private List<MeetingLogResponseDto> logs = new ArrayList<>();
    private Integer totalLoggedMinutes;
}
