package com.team.portal.controller;

import com.team.portal.dto.request.LoginRequest;
import com.team.portal.dto.response.ApiResponse;
import com.team.portal.dto.response.AuthResponse;
import com.team.portal.dto.response.UserDto;
import com.team.portal.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Đăng nhập thành công", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getMe() {
        return ResponseEntity.ok(ApiResponse.ok(UserDto.fromEntity(authService.getCurrentUser())));
    }
}
