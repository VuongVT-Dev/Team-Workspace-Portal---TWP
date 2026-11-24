package com.team.portal.repository;

import com.team.portal.entity.Task;
import com.team.portal.entity.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    @Query("SELECT t FROM Task t LEFT JOIN FETCH t.assigner LEFT JOIN FETCH t.assignee LEFT JOIN FETCH t.phase WHERE t.assignee.id = :assigneeId ORDER BY t.id DESC")
    List<Task> findByAssigneeId(@Param("assigneeId") Long assigneeId);

    @Query("SELECT t FROM Task t LEFT JOIN FETCH t.assigner LEFT JOIN FETCH t.assignee LEFT JOIN FETCH t.phase WHERE t.phase.id = :phaseId ORDER BY t.id DESC")
    List<Task> findByPhaseId(@Param("phaseId") Long phaseId);

    @Query("SELECT t FROM Task t LEFT JOIN FETCH t.assigner LEFT JOIN FETCH t.assignee LEFT JOIN FETCH t.phase WHERE t.status = :status ORDER BY t.id DESC")
    List<Task> findByStatus(@Param("status") TaskStatus status);

    List<Task> findAllByOrderByStartDateAsc();

    boolean existsByTaskCode(String taskCode);

    long countByPhaseId(Long phaseId);
    long countByPhaseIdAndStatus(Long phaseId, TaskStatus status);
    long countByPhaseIdAndStatusIn(Long phaseId, Collection<TaskStatus> statuses);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.phase.id = :phaseId AND t.endDate < :today AND t.status <> :doneStatus")
    long countOverdueByPhaseId(@Param("phaseId") Long phaseId, @Param("today") LocalDate today, @Param("doneStatus") TaskStatus doneStatus);

    @Query("SELECT t FROM Task t LEFT JOIN FETCH t.assigner LEFT JOIN FETCH t.assignee LEFT JOIN FETCH t.phase ORDER BY t.id DESC")
    List<Task> findAllWithDetails();
}
