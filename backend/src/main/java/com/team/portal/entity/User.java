package com.team.portal.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.team.portal.entity.enums.Role;
import com.team.portal.entity.enums.TeamRole;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @JsonIgnore
    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, unique = true, length = 120)
    private String email;

    @Column(nullable = false, unique = true, length = 20)
    private String studentCode;

    @Column(length = 500)
    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "team_role", nullable = false, length = 20)
    private TeamRole teamRole = TeamRole.MEMBER;

    public boolean isAdmin() {
        return this.role == Role.ADMIN;
    }

    public boolean canCreateTask() {
        return this.role == Role.ADMIN
                || this.teamRole == TeamRole.TEAM_LEADER
                || this.teamRole == TeamRole.CO_LEADER;
    }

    public boolean isKeyRole() {
        return canCreateTask();
    }
}
