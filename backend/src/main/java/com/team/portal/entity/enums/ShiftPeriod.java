package com.team.portal.entity.enums;

public enum ShiftPeriod {
    MORNING_1("7h-9h"),
    MORNING_2("9h-11h"),
    AFTERNOON_1("13h-15h"),
    AFTERNOON_2("15h-17h"),
    EVENING("19h-21h");

    private final String timeRange;

    ShiftPeriod(String timeRange) {
        this.timeRange = timeRange;
    }

    public String getTimeRange() {
        return timeRange;
    }
}
