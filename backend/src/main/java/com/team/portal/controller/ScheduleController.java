package com.team.portal.controller;

import com.team.portal.dto.request.ToggleScheduleRequest;
import com.team.portal.dto.response.ApiResponse;
import com.team.portal.dto.response.ScheduleSlotDto;
import com.team.portal.service.ScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schedules")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ScheduleSlotDto>>> getWeeklySchedule() {
        List<ScheduleSlotDto> grid = scheduleService.getWeeklyScheduleGrid();
        return ResponseEntity.ok(ApiResponse.ok(grid));
    }

    @PostMapping("/toggle")
    public ResponseEntity<ApiResponse<Void>> toggleSchedule(@Valid @RequestBody ToggleScheduleRequest request) {
        scheduleService.toggleSchedule(request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật lịch thành công", null));
    }
}
