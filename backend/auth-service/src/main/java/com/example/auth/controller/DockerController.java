package com.example.auth.controller;

import com.example.auth.dto.MessageResponse;
import com.example.auth.service.DockerService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth/docker")
public class DockerController {

    private final DockerService dockerService;

    public DockerController(DockerService dockerService) {
        this.dockerService = dockerService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/start/{serviceName}")
    public ResponseEntity<?> startService(@PathVariable String serviceName) {
        try {
            dockerService.startService(serviceName);
            return ResponseEntity.ok(new MessageResponse("Service " + serviceName + " started successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/stop/{serviceName}")
    public ResponseEntity<?> stopService(@PathVariable String serviceName) {
        try {
            dockerService.stopService(serviceName);
            return ResponseEntity.ok(new MessageResponse("Service " + serviceName + " stopped successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/restart/{serviceName}")
    public ResponseEntity<?> restartService(@PathVariable String serviceName) {
        try {
            dockerService.restartService(serviceName);
            return ResponseEntity.ok(new MessageResponse("Service " + serviceName + " restarted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/summary")
    public ResponseEntity<java.util.Map<String, String>> getHealthSummary() {
        java.util.Map<String, String> summary = new java.util.HashMap<>();
        String[] services = { "api-gateway", "auth-service", "order-service", "inventory-service", "payment-service",
                "analytics-service", "product-service" };
        for (String service : services) {
            summary.put(service, dockerService.getContainerStatus(service));
        }
        return ResponseEntity.ok(summary);
    }

    @GetMapping(value = "/events")
    public org.springframework.web.servlet.mvc.method.annotation.SseEmitter streamEvents() {
        org.springframework.web.servlet.mvc.method.annotation.SseEmitter emitter = new org.springframework.web.servlet.mvc.method.annotation.SseEmitter(
                0L); // Infinite timeout
        dockerService.streamEvents(emitter);
        return emitter;
    }
}
