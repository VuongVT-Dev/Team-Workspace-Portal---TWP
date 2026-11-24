package com.team.portal.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "project_extensions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectExtension {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(nullable = false, length = 150)
    private String itemName;

    @Column(length = 50)
    private String version;

    @Column(length = 10000)
    private String description;

    @Column(length = 500)
    private String referenceUrl;

    @Column(length = 10000)
    private String configSnippet;
}
