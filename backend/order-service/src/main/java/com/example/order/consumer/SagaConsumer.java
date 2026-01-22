package com.example.order.consumer;

import com.example.common.constants.KafkaConstants;
import com.example.common.event.BaseEvent;
import com.example.common.event.InventoryEvent;
import com.example.common.event.PaymentEvent;
import com.example.order.domain.Order;
import com.example.order.repository.OrderRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class SagaConsumer {
    private static final Logger log = LoggerFactory.getLogger(SagaConsumer.class);

    private final OrderRepository orderRepository;
    private final ObjectMapper objectMapper;

    public SagaConsumer(OrderRepository orderRepository, ObjectMapper objectMapper) {
        this.orderRepository = orderRepository;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = KafkaConstants.INVENTORY_EVENTS_TOPIC, groupId = "order-service-inventory-group")
    @Transactional
    public void consumeInventoryEvent(String message) {
        log.info("Received inventory event: {}", message);
        try {
            BaseEvent<InventoryEvent> event = objectMapper.readValue(message, new TypeReference<>() {});
            InventoryEvent payload = event.payload();
            
            orderRepository.findById(payload.orderId()).ifPresent(order -> {
                if (payload.status() == InventoryEvent.InventoryStatus.RESERVED) {
                    order.setStatus(Order.OrderStatus.INVENTORY_RESERVED);
                } else {
                    order.setStatus(Order.OrderStatus.FAILED);
                }
                orderRepository.save(order);
                log.info("Updated order {} status to {}", order.getId(), order.getStatus());
            });
        } catch (JsonProcessingException e) {
            log.error("Failed to parse inventory event", e);
        }
    }

    @KafkaListener(topics = KafkaConstants.PAYMENT_EVENTS_TOPIC, groupId = "order-service-payment-group")
    @Transactional
    public void consumePaymentEvent(String message) {
        log.info("Received payment event: {}", message);
        try {
            BaseEvent<PaymentEvent> event = objectMapper.readValue(message, new TypeReference<>() {});
            PaymentEvent payload = event.payload();

            orderRepository.findById(payload.orderId()).ifPresent(order -> {
                if (payload.status() == PaymentEvent.PaymentStatus.SUCCEEDED) {
                    order.setStatus(Order.OrderStatus.PAYMENT_COMPLETED);
                } else {
                    order.setStatus(Order.OrderStatus.FAILED);
                }
                orderRepository.save(order);
                log.info("Updated order {} status to {}", order.getId(), order.getStatus());
            });
        } catch (JsonProcessingException e) {
            log.error("Failed to parse payment event", e);
        }
    }
}
