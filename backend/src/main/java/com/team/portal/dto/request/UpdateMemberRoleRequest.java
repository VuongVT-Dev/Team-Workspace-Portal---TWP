package com.team.portal.dto.request;

import com.team.portal.entity.enums.Role;
import com.team.portal.entity.enums.TeamRole;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateMemberRoleRequest {

    @NotNull(message = "Vai trò hệ thống không được để trống")
    private Role role;

    @NotNull(message = "Vai trò nhóm không được để trống")
    private TeamRole teamRole;
}
