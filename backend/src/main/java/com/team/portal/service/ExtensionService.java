package com.team.portal.service;

import com.team.portal.dto.request.CreateExtensionRequest;
import com.team.portal.dto.response.ExtensionResponseDto;
import com.team.portal.entity.ProjectExtension;
import com.team.portal.repository.ProjectExtensionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExtensionService {

    private final ProjectExtensionRepository extensionRepository;

    public List<ExtensionResponseDto> getAllExtensions(String category) {
        List<ProjectExtension> list;
        if (category != null && !category.isBlank()) {
            list = extensionRepository.findAllByCategory(category.toUpperCase());
        } else {
            list = extensionRepository.findAllByOrderByCategoryAscItemNameAsc();
        }
        return list.stream().map(ExtensionResponseDto::fromEntity).collect(Collectors.toList());
    }

    @Transactional
    public ExtensionResponseDto createExtension(CreateExtensionRequest request) {
        ProjectExtension ext = ProjectExtension.builder()
                .category(request.getCategory().toUpperCase().trim())
                .itemName(request.getItemName().trim())
                .version(request.getVersion())
                .description(request.getDescription())
                .referenceUrl(request.getReferenceUrl())
                .configSnippet(request.getConfigSnippet())
                .build();

        ProjectExtension saved = extensionRepository.save(ext);
        return ExtensionResponseDto.fromEntity(saved);
    }
}
