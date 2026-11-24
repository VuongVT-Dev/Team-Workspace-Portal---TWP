package com.team.portal.dto.response;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhaseResponseDto {
    private Long id;
    private String name;
    private String description;
    private Integer displayOrder;
    private LocalDate startDate;
    private LocalDate endDate;
    private long totalTasks;
    private long doneTasks;
    private long reviewingTasks;
    private long overdueTasks;
    private int progressPercentage;
    private UserDto createdBy;
}
