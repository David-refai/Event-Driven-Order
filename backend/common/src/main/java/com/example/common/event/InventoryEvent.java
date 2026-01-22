package com.example.common.event;

public record InventoryEvent(
        String orderId,
        InventoryStatus status) {
    public enum InventoryStatus {
        RESERVED, FAILED
    }
}
