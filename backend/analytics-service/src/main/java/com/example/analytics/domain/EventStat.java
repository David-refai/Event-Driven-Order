package com.example.analytics.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "event_stats")
public class EventStat {
    @Id
    private String eventType;
    private Long count;

    public EventStat() {}
    public EventStat(String eventType, Long count) {
        this.eventType = eventType;
        this.count = count;
    }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }
    public Long getCount() { return count; }
    public void setCount(Long count) { this.count = count; }
}
