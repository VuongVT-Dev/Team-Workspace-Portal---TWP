package com.team.portal.controller;

import com.team.portal.dto.request.*;
import com.team.portal.dto.response.ApiResponse;
import com.team.portal.dto.response.TaskResponseDto;
import com.team.portal.entity.enums.TaskStatus;
import com.team.portal.service.StorageService;
import com.team.portal.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;
    private final StorageService storageService;

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<TaskResponseDto>>> getMyTasks() {
        List<TaskResponseDto> myTasks = taskService.getMyTasks();
        return ResponseEntity.ok(ApiResponse.ok(myTasks));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TaskResponseDto>>> getAllTasks(
            @RequestParam(value = "phaseId", required = false) Long phaseId,
            @RequestParam(value = "status", required = false) TaskStatus status) {
        List<TaskResponseDto> tasks = taskService.getAllTasks(phaseId, status);
        return ResponseEntity.ok(ApiResponse.ok(tasks));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TaskResponseDto>> createTask(@Valid @RequestBody CreateTaskRequest request) {
        TaskResponseDto created = taskService.createTask(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Tạo task thành công (Trạng thái: Back Log)", created));
    }

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadAttachment(@RequestParam("file") MultipartFile file) {
        String fileUrl = storageService.store(file);
        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "attachment";
        return ResponseEntity.ok(ApiResponse.ok("Tải tệp đính kèm thành công", Map.of(
                "url", fileUrl,
                "name", originalName
        )));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<TaskResponseDto>> updateStatus(
            @PathVariable("id") Long id,
            @Valid @RequestBody UpdateTaskStatusRequest request) {
        TaskResponseDto updated = taskService.updateTaskStatus(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật trạng thái thành công", updated));
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<ApiResponse<TaskResponseDto>> assignTask(
            @PathVariable("id") Long id,
            @RequestBody AssignTaskRequest request) {
        TaskResponseDto updated = taskService.assignTask(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Phân công task thành công", updated));
    }

    @PostMapping("/{id}/claim")
    public ResponseEntity<ApiResponse<TaskResponseDto>> claimTask(@PathVariable("id") Long id) {
        TaskResponseDto updated = taskService.claimTask(id);
        return ResponseEntity.ok(ApiResponse.ok("Nhận task thành công! Bạn đã trở thành người phụ trách.", updated));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<ApiResponse<TaskResponseDto>> submitWork(
            @PathVariable("id") Long id,
            @Valid @RequestBody SubmitWorkRequest request) {
        TaskResponseDto updated = taskService.submitWork(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Nộp kết quả thành công! Task chuyển sang trạng thái PENDING chờ Review.", updated));
    }

    @PostMapping("/{id}/start-review")
    public ResponseEntity<ApiResponse<TaskResponseDto>> startReview(@PathVariable("id") Long id) {
        TaskResponseDto updated = taskService.startReview(id);
        return ResponseEntity.ok(ApiResponse.ok("Đã chuyển task sang trạng thái REVIEWING", updated));
    }

    @PostMapping("/{id}/review")
    public ResponseEntity<ApiResponse<TaskResponseDto>> reviewTask(
            @PathVariable("id") Long id,
            @Valid @RequestBody ReviewTaskRequest request) {
        TaskResponseDto updated = taskService.reviewTask(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Duyệt kết quả review thành công", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(@PathVariable("id") Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.ok(ApiResponse.ok("Đã xóa task thành công", null));
    }
}
