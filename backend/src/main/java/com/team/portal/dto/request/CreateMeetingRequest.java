package com.team.portal.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateMeetingRequest {

    @NotBlank(message = "Tiêu đề cuộc họp không được để trống")
    private String title;

    @NotBlank(message = "Đường dẫn Google Meet không được để trống")
    private String googleMeetLink;

    @NotNull(message = "Thời gian bắt đầu không được để trống")
    private LocalDateTime startTime;

    @NotNull(message = "Thời lượng họp không được để trống")
    @Min(value = 5, message = "Thời lượng họp tối thiểu là 5 phút")
    private Integer durationMinutes = 60;

    private String takeNoteContent;
    private String noteDocUrl;
}
