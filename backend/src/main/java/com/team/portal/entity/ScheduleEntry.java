package com.team.portal.entity;

import com.team.portal.entity.enums.DayOfWeekCode;
import com.team.portal.entity.enums.ScheduleSlotType;
import com.team.portal.entity.enums.ShiftPeriod;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "schedule_entries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private DayOfWeekCode dayOfWeek;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ShiftPeriod shift;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private ScheduleSlotType type;

    private LocalDate specificDate;

    @Column(length = 200)
    private String subjectOrReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
