package com.team.portal.repository;

import com.team.portal.entity.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Long> {
    @Query("SELECT m FROM Meeting m LEFT JOIN FETCH m.createdBy ORDER BY m.startTime DESC")
    List<Meeting> findAllWithCreator();
}
