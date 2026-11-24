package com.team.portal.dto.response;

import com.team.portal.entity.ProjectExtension;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExtensionResponseDto {
    private Long id;
    private String category;
    private String itemName;
    private String version;
    private String description;
    private String referenceUrl;
    private String configSnippet;

    public static ExtensionResponseDto fromEntity(ProjectExtension ext) {
        if (ext == null) return null;
        return ExtensionResponseDto.builder()
                .id(ext.getId())
                .category(ext.getCategory())
                .itemName(ext.getItemName())
                .version(ext.getVersion())
                .description(ext.getDescription())
                .referenceUrl(ext.getReferenceUrl())
                .configSnippet(ext.getConfigSnippet())
                .build();
    }
}
