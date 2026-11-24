package com.team.portal.controller;

import com.team.portal.dto.request.CreateExtensionRequest;
import com.team.portal.dto.response.ApiResponse;
import com.team.portal.dto.response.ExtensionResponseDto;
import com.team.portal.service.ExtensionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/extensions")
@RequiredArgsConstructor
public class ExtensionController {

    private final ExtensionService extensionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ExtensionResponseDto>>> getAllExtensions(
            @RequestParam(value = "category", required = false) String category) {
        List<ExtensionResponseDto> list = extensionService.getAllExtensions(category);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ExtensionResponseDto>> createExtension(
            @Valid @RequestBody CreateExtensionRequest request) {
        ExtensionResponseDto created = extensionService.createExtension(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Thêm cấu hình mở rộng thành công", created));
    }
}
