package com.example.common.event;

import java.time.LocalDateTime;
import java.util.UUID;

public record BaseEvent<T>(
        String eventId,
        String eventType,
        LocalDateTime timestamp,
        String correlationId,
        T payload) {
    public static <T> BaseEvent<T> create(String eventType, T payload, String correlationId) {
        return new BaseEvent<>(
                UUID.randomUUID().toString(),
                eventType,
                LocalDateTime.now(),
                correlationId,
                payload);
    }
}
