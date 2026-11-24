package com.team.portal.controller;

import com.team.portal.dto.request.CreateMeetingRequest;
import com.team.portal.dto.request.LogAttendanceRequest;
import com.team.portal.dto.request.UpdateMeetingNotesRequest;
import com.team.portal.dto.response.ApiResponse;
import com.team.portal.dto.response.MeetingLogResponseDto;
import com.team.portal.dto.response.MeetingResponseDto;
import com.team.portal.service.MeetingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/meetings")
@RequiredArgsConstructor
public class MeetingController {

    private final MeetingService meetingService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MeetingResponseDto>>> getAllMeetings() {
        List<MeetingResponseDto> meetings = meetingService.getAllMeetings();
        return ResponseEntity.ok(ApiResponse.ok(meetings));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MeetingResponseDto>> createMeeting(@Valid @RequestBody CreateMeetingRequest request) {
        MeetingResponseDto created = meetingService.createMeeting(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Tạo buổi họp thành công", created));
    }

    @PatchMapping("/{id}/notes")
    public ResponseEntity<ApiResponse<MeetingResponseDto>> updateNotes(
            @PathVariable("id") Long id,
            @RequestBody UpdateMeetingNotesRequest request) {
        MeetingResponseDto updated = meetingService.updateNotes(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật biên bản họp thành công", updated));
    }

    @PostMapping("/{id}/attendance")
    public ResponseEntity<ApiResponse<MeetingLogResponseDto>> logAttendance(
            @PathVariable("id") Long id,
            @Valid @RequestBody LogAttendanceRequest request) {
        MeetingLogResponseDto log = meetingService.logAttendance(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Ghi nhận điểm danh & logtime thành công", log));
    }
}
