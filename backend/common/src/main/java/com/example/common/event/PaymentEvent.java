package com.example.common.event;

public record PaymentEvent(
        String orderId,
        PaymentStatus status) {
    public enum PaymentStatus {
        SUCCEEDED, FAILED
    }
}
