package com.example.analytics.repository;

import com.example.analytics.domain.EventStat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface EventStatRepository extends JpaRepository<EventStat, String> {
    @Modifying
    @Query("UPDATE EventStat e SET e.count = e.count + 1 WHERE e.eventType = :eventType")
    void incrementCount(String eventType);
}
