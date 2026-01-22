package com.example.analytics.controller;

import com.example.analytics.domain.EventStat;
import com.example.analytics.repository.EventStatRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {
    private final EventStatRepository repository;

    public AnalyticsController(EventStatRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/stats")
    public List<EventStat> getStats() {
        return repository.findAll();
    }
}
