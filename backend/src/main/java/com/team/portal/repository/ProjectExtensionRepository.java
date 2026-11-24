package com.team.portal.repository;

import com.team.portal.entity.ProjectExtension;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectExtensionRepository extends JpaRepository<ProjectExtension, Long> {
    List<ProjectExtension> findAllByCategory(String category);
    List<ProjectExtension> findAllByOrderByCategoryAscItemNameAsc();
}
