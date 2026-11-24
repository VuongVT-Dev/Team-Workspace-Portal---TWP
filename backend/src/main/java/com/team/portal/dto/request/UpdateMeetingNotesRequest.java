package com.team.portal.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateMeetingNotesRequest {
    private String takeNoteContent;
    private String noteDocUrl;
}
