package com.team.portal.dto.response;

import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardDto {
    private long totalMembers;
    private long totalPhases;
    private long totalTasks;
    private long doneTasks;
    private long pendingReviewTasks;
    private long processingTasks;
    private long backlogTasks;
    private long overdueRedTasks;
    private long overdueYellowTasks;
    private int overallProgressPercentage;
    private Map<String, Long> tasksByStatus;
    private List<PhaseResponseDto> phases;
    private List<MemberWorkloadDto> memberWorkloads;
    private List<TaskResponseDto> warningTasks;
    private List<TaskResponseDto> recentTasks;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MemberWorkloadDto {
        private UserDto user;
        private long totalAssigned;
        private long backlogCount;
        private long processingCount;
        private long pendingCount;
        private long reviewingCount;
        private long doneCount;
        private long overdueCount;
    }
}
