package com.team.portal.repository;

import com.team.portal.entity.ScheduleEntry;
import com.team.portal.entity.enums.DayOfWeekCode;
import com.team.portal.entity.enums.ShiftPeriod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ScheduleEntryRepository extends JpaRepository<ScheduleEntry, Long> {
    List<ScheduleEntry> findByUserId(Long userId);

    Optional<ScheduleEntry> findByUserIdAndDayOfWeekAndShift(Long userId, DayOfWeekCode dayOfWeek, ShiftPeriod shift);

    void deleteByUserIdAndDayOfWeekAndShift(Long userId, DayOfWeekCode dayOfWeek, ShiftPeriod shift);

    @Query("SELECT s FROM ScheduleEntry s JOIN FETCH s.user ORDER BY s.dayOfWeek, s.shift")
    List<ScheduleEntry> findAllWithUser();
}
