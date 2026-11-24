package com.team.portal.repository;

import com.team.portal.entity.Phase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhaseRepository extends JpaRepository<Phase, Long> {
    @Query("SELECT p FROM Phase p LEFT JOIN FETCH p.createdBy ORDER BY p.displayOrder ASC, p.startDate ASC")
    List<Phase> findAllByOrderByDisplayOrderAscStartDateAsc();
}
