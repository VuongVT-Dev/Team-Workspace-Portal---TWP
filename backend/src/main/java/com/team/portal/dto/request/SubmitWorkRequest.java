package com.team.portal.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SubmitWorkRequest {

    @NotBlank(message = "Nội dung nộp bài (link PR, mô tả kết quả) không được để trống")
    private String workSubmissionNote;

    private String attachmentUrl;

    private String attachmentName;
}
