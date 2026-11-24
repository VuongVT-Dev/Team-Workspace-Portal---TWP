package com.team.portal.dto.response;

import com.team.portal.entity.ProjectDocument;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentResponseDto {
    private Long id;
    private String title;
    private String category;
    private String fileUrl;
    private String fileType;
    private Long fileSizeKb;
    private LocalDateTime uploadedAt;
    private UserDto uploadedBy;

    public static DocumentResponseDto fromEntity(ProjectDocument doc) {
        if (doc == null) return null;
        return DocumentResponseDto.builder()
                .id(doc.getId())
                .title(doc.getTitle())
                .category(doc.getCategory())
                .fileUrl(doc.getFileUrl())
                .fileType(doc.getFileType())
                .fileSizeKb(doc.getFileSizeKb())
                .uploadedAt(doc.getUploadedAt())
                .uploadedBy(UserDto.fromEntity(doc.getUploadedBy()))
                .build();
    }
}
