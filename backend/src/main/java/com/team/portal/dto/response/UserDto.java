package com.team.portal.dto.response;

import com.team.portal.entity.User;
import com.team.portal.entity.enums.Role;
import com.team.portal.entity.enums.TeamRole;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String studentCode;
    private String avatarUrl;
    private Role role;
    private TeamRole teamRole;
    private boolean canCreateTask;

    public static UserDto fromEntity(User user) {
        if (user == null) return null;
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .studentCode(user.getStudentCode())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole())
                .teamRole(user.getTeamRole() != null ? user.getTeamRole() : TeamRole.MEMBER)
                .canCreateTask(user.canCreateTask())
                .build();
    }
}
