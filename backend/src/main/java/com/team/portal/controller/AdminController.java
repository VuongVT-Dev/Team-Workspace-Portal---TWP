package com.team.portal.controller;

import com.team.portal.dto.request.CreateMemberRequest;
import com.team.portal.dto.request.UpdateMemberRoleRequest;
import com.team.portal.dto.response.AdminDashboardDto;
import com.team.portal.dto.response.ApiResponse;
import com.team.portal.dto.response.UserDto;
import com.team.portal.service.AdminDashboardService;
import com.team.portal.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;
    private final AdminDashboardService adminDashboardService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardDto>> getDashboard() {
        AdminDashboardDto dashboard = adminDashboardService.getDashboard();
        return ResponseEntity.ok(ApiResponse.ok(dashboard));
    }

    @GetMapping("/members")
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllMembers() {
        List<UserDto> members = userService.getAllMembers();
        return ResponseEntity.ok(ApiResponse.ok(members));
    }

    @PostMapping("/members")
    public ResponseEntity<ApiResponse<UserDto>> createMember(@Valid @RequestBody CreateMemberRequest request) {
        UserDto created = userService.createMember(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Tạo tài khoản thành viên thành công", created));
    }

    @PatchMapping("/members/{id}/role")
    public ResponseEntity<ApiResponse<UserDto>> updateMemberRole(
            @PathVariable("id") Long id,
            @Valid @RequestBody UpdateMemberRoleRequest request) {
        UserDto updated = userService.updateMemberRole(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật phân quyền thành viên thành công", updated));
    }

    @DeleteMapping("/members/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMember(@PathVariable("id") Long id) {
        userService.deleteMember(id);
        return ResponseEntity.ok(ApiResponse.ok("Đã xóa tài khoản thành viên", null));
    }
}
