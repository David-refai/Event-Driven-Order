package com.example.common.event;

import java.math.BigDecimal;
import java.util.List;

public record OrderCreatedEvent(
                String orderId,
                String customerId,
                BigDecimal totalAmount,
                String currency,
                List<OrderItemPayload> items) {
        public record OrderItemPayload(
                        String productId,
                        String productName,
                        BigDecimal unitPrice,
                        Integer quantity) {
        }
}
