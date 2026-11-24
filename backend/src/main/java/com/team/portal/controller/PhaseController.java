package com.team.portal.controller;

import com.team.portal.dto.request.CreatePhaseRequest;
import com.team.portal.dto.response.ApiResponse;
import com.team.portal.dto.response.PhaseResponseDto;
import com.team.portal.service.PhaseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/phases")
@RequiredArgsConstructor
public class PhaseController {

    private final PhaseService phaseService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PhaseResponseDto>>> getAllPhases() {
        List<PhaseResponseDto> phases = phaseService.getAllPhasesWithProgress();
        return ResponseEntity.ok(ApiResponse.ok(phases));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PhaseResponseDto>> createPhase(@Valid @RequestBody CreatePhaseRequest request) {
        PhaseResponseDto created = phaseService.createPhase(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Tạo Phase mới thành công", created));
    }
}
