package com.team.portal.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateExtensionRequest {

    @NotBlank(message = "Danh mục không được để trống (IDE, LANGUAGE, FRAMEWORK, PLUGIN, ENV_CONFIG)")
    private String category;

    @NotBlank(message = "Tên mục không được để trống")
    private String itemName;

    private String version;
    private String description;
    private String referenceUrl;
    private String configSnippet;
}
