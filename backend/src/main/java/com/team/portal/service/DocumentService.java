package com.team.portal.service;

import com.team.portal.dto.response.DocumentResponseDto;
import com.team.portal.entity.ProjectDocument;
import com.team.portal.entity.User;
import com.team.portal.exception.BadRequestException;
import com.team.portal.repository.ProjectDocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final ProjectDocumentRepository documentRepository;
    private final StorageService storageService;
    private final AuthService authService;

    @Transactional(readOnly = true)
    public List<DocumentResponseDto> getAllDocuments() {
        return documentRepository.findAllByOrderByUploadedAtDesc().stream()
                .map(DocumentResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public DocumentResponseDto uploadDocument(MultipartFile file, String title, String category) {
        User currentUser = authService.getCurrentUser();

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Tập tin tải lên không được để trống");
        }

        String fileUrl = storageService.store(file);
        long fileSizeKb = file.getSize() / 1024;

        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "";
        String fileType = "";
        int dot = originalFilename.lastIndexOf('.');
        if (dot > 0) {
            fileType = originalFilename.substring(dot + 1).toUpperCase();
        }

        ProjectDocument doc = ProjectDocument.builder()
                .title(title != null && !title.isBlank() ? title.trim() : originalFilename)
                .category(category != null && !category.isBlank() ? category.trim() : "Tài liệu chung")
                .fileUrl(fileUrl)
                .fileType(fileType)
                .fileSizeKb(fileSizeKb)
                .uploadedAt(LocalDateTime.now())
                .uploadedBy(currentUser)
                .build();

        ProjectDocument saved = documentRepository.save(doc);
        return DocumentResponseDto.fromEntity(saved);
    }
}
