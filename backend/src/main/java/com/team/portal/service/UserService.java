package com.team.portal.service;

import com.team.portal.dto.request.CreateMemberRequest;
import com.team.portal.dto.request.UpdateMemberRoleRequest;
import com.team.portal.dto.request.UpdateProfileRequest;
import com.team.portal.dto.response.UserDto;
import com.team.portal.entity.User;
import com.team.portal.entity.enums.Role;
import com.team.portal.entity.enums.TeamRole;
import com.team.portal.exception.BadRequestException;
import com.team.portal.exception.ForbiddenException;
import com.team.portal.exception.ResourceNotFoundException;
import com.team.portal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;

    public UserDto getCurrentProfile() {
        return UserDto.fromEntity(authService.getCurrentUser());
    }

    @Transactional
    public UserDto updateProfile(UpdateProfileRequest request) {
        User currentUser = authService.getCurrentUser();

        if (!currentUser.getEmail().equalsIgnoreCase(request.getEmail())
                && userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email này đã được sử dụng bởi thành viên khác");
        }

        if (!currentUser.getStudentCode().equalsIgnoreCase(request.getStudentCode())
                && userRepository.existsByStudentCode(request.getStudentCode())) {
            throw new BadRequestException("Mã số sinh viên (MSSV) này đã tồn tại trong hệ thống");
        }

        currentUser.setFullName(request.getFullName().trim());
        currentUser.setEmail(request.getEmail().trim());
        currentUser.setStudentCode(request.getStudentCode().trim());
        if (request.getAvatarUrl() != null && !request.getAvatarUrl().isBlank()) {
            currentUser.setAvatarUrl(request.getAvatarUrl().trim());
        }

        User savedUser = userRepository.save(currentUser);
        return UserDto.fromEntity(savedUser);
    }

    public List<UserDto> getAllMembers() {
        return userRepository.findAll().stream()
                .map(UserDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDto createMember(CreateMemberRequest request) {
        User currentUser = authService.getCurrentUser();
        if (!currentUser.isAdmin()) {
            throw new ForbiddenException("Chỉ tài khoản ADMIN mới có quyền tạo tài khoản thành viên!");
        }

        String username = request.getUsername().trim().toLowerCase();
        String email = request.getEmail().trim().toLowerCase();
        String studentCode = request.getStudentCode().trim().toUpperCase();

        if (userRepository.existsByUsername(username)) {
            throw new BadRequestException("Tên đăng nhập '" + username + "' đã tồn tại!");
        }
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email '" + email + "' đã được sử dụng!");
        }
        if (userRepository.existsByStudentCode(studentCode)) {
            throw new BadRequestException("Mã số sinh viên '" + studentCode + "' đã tồn tại!");
        }

        String avatar = (request.getAvatarUrl() != null && !request.getAvatarUrl().isBlank())
                ? request.getAvatarUrl().trim()
                : "https://api.dicebear.com/7.x/bottts/svg?seed=" + username;

        Role assignedRole = request.getRole() != null ? request.getRole() : Role.MEMBER;
        TeamRole assignedTeamRole = request.getTeamRole() != null
                ? request.getTeamRole()
                : (assignedRole == Role.ADMIN ? TeamRole.TEAM_LEADER : TeamRole.MEMBER);

        User newUser = User.builder()
                .username(username)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName().trim())
                .email(email)
                .studentCode(studentCode)
                .avatarUrl(avatar)
                .role(assignedRole)
                .teamRole(assignedTeamRole)
                .build();

        User saved = userRepository.save(newUser);
        return UserDto.fromEntity(saved);
    }

    @Transactional
    public UserDto updateMemberRole(Long userId, UpdateMemberRoleRequest request) {
        User currentUser = authService.getCurrentUser();
        if (!currentUser.isAdmin()) {
            throw new ForbiddenException("Chỉ tài khoản ADMIN mới có quyền phân quyền thành viên!");
        }

        User target = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thành viên với ID: " + userId));

        if (target.getId().equals(currentUser.getId()) && request.getRole() != Role.ADMIN) {
            throw new BadRequestException("Không thể tự hạ quyền ADMIN của chính mình!");
        }

        target.setRole(request.getRole());
        target.setTeamRole(request.getTeamRole());
        User saved = userRepository.save(target);
        return UserDto.fromEntity(saved);
    }

    @Transactional
    public void deleteMember(Long userId) {
        User currentUser = authService.getCurrentUser();
        if (!currentUser.isAdmin()) {
            throw new ForbiddenException("Chỉ tài khoản ADMIN mới có quyền xóa thành viên!");
        }
        if (currentUser.getId().equals(userId)) {
            throw new BadRequestException("Không thể tự xóa tài khoản đang đăng nhập!");
        }
        User target = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thành viên với ID: " + userId));
        try {
            userRepository.delete(target);
            userRepository.flush();
        } catch (Exception ex) {
            throw new BadRequestException("Không thể xóa thành viên đã có dữ liệu công việc/cuộc họp liên kết trong hệ thống.");
        }
    }
}
