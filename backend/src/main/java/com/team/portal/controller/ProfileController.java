package com.team.portal.controller;

import com.team.portal.dto.request.UpdateProfileRequest;
import com.team.portal.dto.response.ApiResponse;
import com.team.portal.dto.response.UserDto;
import com.team.portal.service.StorageService;
import com.team.portal.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final UserService userService;
    private final StorageService storageService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getMyProfile() {
        UserDto profile = userService.getCurrentProfile();
        return ResponseEntity.ok(ApiResponse.ok(profile));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> updateMyProfile(@Valid @RequestBody UpdateProfileRequest request) {
        UserDto updated = userService.updateProfile(request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật hồ sơ thành công", updated));
    }

    @GetMapping("/members")
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllMembers() {
        List<UserDto> members = userService.getAllMembers();
        return ResponseEntity.ok(ApiResponse.ok(members));
    }

    @PostMapping("/avatar")
    public ResponseEntity<ApiResponse<String>> uploadAvatar(@RequestParam("file") MultipartFile file) {
        String avatarUrl = storageService.store(file, "avatars");
        return ResponseEntity.ok(ApiResponse.ok("Tải ảnh đại diện thành công", avatarUrl));
    }
}
