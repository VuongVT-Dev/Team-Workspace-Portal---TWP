package com.team.portal.service;

import com.team.portal.dto.request.ToggleScheduleRequest;
import com.team.portal.dto.response.BusyMemberDto;
import com.team.portal.dto.response.ScheduleSlotDto;
import com.team.portal.entity.ScheduleEntry;
import com.team.portal.entity.User;
import com.team.portal.entity.enums.DayOfWeekCode;
import com.team.portal.entity.enums.ShiftPeriod;
import com.team.portal.repository.ScheduleEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final ScheduleEntryRepository scheduleRepository;
    private final AuthService authService;

    public List<ScheduleSlotDto> getWeeklyScheduleGrid() {
        List<ScheduleEntry> allEntries = scheduleRepository.findAllWithUser();

        // Gom nhóm theo "DAY_SHIFT"
        Map<String, List<ScheduleEntry>> entryMap = allEntries.stream()
                .collect(Collectors.groupingBy(e -> e.getDayOfWeek().name() + "_" + e.getShift().name()));

        List<ScheduleSlotDto> grid = new ArrayList<>();

        for (DayOfWeekCode day : DayOfWeekCode.values()) {
            for (ShiftPeriod shift : ShiftPeriod.values()) {
                String key = day.name() + "_" + shift.name();
                List<ScheduleEntry> entries = entryMap.getOrDefault(key, Collections.emptyList());

                List<BusyMemberDto> busyMembers = entries.stream()
                        .map(e -> BusyMemberDto.builder()
                                .userId(e.getUser().getId())
                                .fullName(e.getUser().getFullName())
                                .avatarUrl(e.getUser().getAvatarUrl())
                                .type(e.getType())
                                .subjectOrReason(e.getSubjectOrReason())
                                .build())
                        .collect(Collectors.toList());

                grid.add(ScheduleSlotDto.builder()
                        .dayOfWeek(day)
                        .shift(shift)
                        .timeRange(shift.getTimeRange())
                        .busyMembers(busyMembers)
                        .isAllFree(busyMembers.isEmpty())
                        .build());
            }
        }

        return grid;
    }

    @Transactional
    public void toggleSchedule(ToggleScheduleRequest request) {
        User currentUser = authService.getCurrentUser();

        Optional<ScheduleEntry> existing = scheduleRepository.findByUserIdAndDayOfWeekAndShift(
                currentUser.getId(), request.getDayOfWeek(), request.getShift());

        if (existing.isPresent()) {
            scheduleRepository.delete(existing.get());
        } else {
            ScheduleEntry entry = ScheduleEntry.builder()
                    .user(currentUser)
                    .dayOfWeek(request.getDayOfWeek())
                    .shift(request.getShift())
                    .type(request.getType())
                    .specificDate(request.getSpecificDate())
                    .subjectOrReason(request.getSubjectOrReason())
                    .build();
            scheduleRepository.save(entry);
        }
    }
}
