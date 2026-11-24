package com.team.portal.controller;

import com.team.portal.dto.response.ApiResponse;
import com.team.portal.dto.response.DocumentResponseDto;
import com.team.portal.service.DocumentService;
import com.team.portal.service.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;
    private final StorageService storageService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DocumentResponseDto>>> getAllDocuments() {
        List<DocumentResponseDto> docs = documentService.getAllDocuments();
        return ResponseEntity.ok(ApiResponse.ok(docs));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DocumentResponseDto>> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "category", required = false) String category) {
        DocumentResponseDto uploaded = documentService.uploadDocument(file, title, category);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Tải lên tài liệu thành công", uploaded));
    }

    @GetMapping("/download/{filename:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String filename) {
        try {
            Path file = storageService.load(filename);
            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() || resource.isReadable()) {
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                        .contentType(MediaType.APPLICATION_OCTET_STREAM)
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
