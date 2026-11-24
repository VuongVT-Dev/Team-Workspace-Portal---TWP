package com.team.portal.repository;

import com.team.portal.entity.MeetingLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MeetingLogRepository extends JpaRepository<MeetingLog, Long> {
    List<MeetingLog> findByMeetingId(Long meetingId);
    List<MeetingLog> findByUserId(Long userId);
    Optional<MeetingLog> findByMeetingIdAndUserId(Long meetingId, Long userId);

    @Query("SELECT ml FROM MeetingLog ml JOIN FETCH ml.user WHERE ml.meeting.id = :meetingId")
    List<MeetingLog> findByMeetingIdWithUser(@Param("meetingId") Long meetingId);
}
