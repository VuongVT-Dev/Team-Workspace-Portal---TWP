package com.team.portal.repository;

import com.team.portal.entity.ProjectDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectDocumentRepository extends JpaRepository<ProjectDocument, Long> {
    @Query("SELECT d FROM ProjectDocument d LEFT JOIN FETCH d.uploadedBy ORDER BY d.uploadedAt DESC")
    List<ProjectDocument> findAllByOrderByUploadedAtDesc();
}
