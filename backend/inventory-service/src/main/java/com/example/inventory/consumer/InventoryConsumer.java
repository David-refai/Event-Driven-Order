package com.example.inventory.consumer;

import com.example.common.constants.KafkaConstants;
import com.example.common.event.BaseEvent;
import com.example.common.event.OrderCreatedEvent;
import com.example.inventory.service.InventoryService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

@Component
public class InventoryConsumer {
    private static final Logger log = LoggerFactory.getLogger(InventoryConsumer.class);

    private final InventoryService inventoryService;
    private final ObjectMapper objectMapper;

    public InventoryConsumer(InventoryService inventoryService, ObjectMapper objectMapper) {
        this.inventoryService = inventoryService;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = KafkaConstants.ORDER_EVENTS_TOPIC, groupId = "inventory-service-group")
    public void consumeOrderCreated(String message, Acknowledgment ack) {
        log.info("Received order event in inventory: {}", message);
        try {
            BaseEvent<OrderCreatedEvent> event = objectMapper.readValue(message, new TypeReference<>() {});
            inventoryService.processOrderCreated(event);
            ack.acknowledge();
        } catch (Exception e) {
            log.error("Error processing order event in inventory", e);
            // ErrorHandler will handle retries/DLQ
            throw new RuntimeException(e);
        }
    }
}
