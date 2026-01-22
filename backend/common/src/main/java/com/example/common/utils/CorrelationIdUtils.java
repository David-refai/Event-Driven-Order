package com.example.common.utils;

import org.slf4j.MDC;
import java.util.UUID;

public class CorrelationIdUtils {
    public static final String CORRELATION_ID_HEADER = "x-correlation-id";

    public static String getCorrelationId() {
        String correlationId = MDC.get(CORRELATION_ID_HEADER);
        if (correlationId == null || correlationId.isEmpty()) {
            correlationId = UUID.randomUUID().toString();
            MDC.put(CORRELATION_ID_HEADER, correlationId);
        }
        return correlationId;
    }

    public static void setCorrelationId(String correlationId) {
        if (correlationId != null && !correlationId.isEmpty()) {
            MDC.put(CORRELATION_ID_HEADER, correlationId);
        } else {
            getCorrelationId(); // Generate if null
        }
    }

    public static void clear() {
        MDC.remove(CORRELATION_ID_HEADER);
    }
}
