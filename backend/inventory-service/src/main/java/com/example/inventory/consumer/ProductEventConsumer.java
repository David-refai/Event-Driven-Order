package com.example.inventory.consumer;

import com.example.common.constants.KafkaConstants;
import com.example.common.event.BaseEvent;
import com.example.inventory.service.InventoryService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

@Component
public class ProductEventConsumer {
    private static final Logger log = LoggerFactory.getLogger(ProductEventConsumer.class);

    private final InventoryService inventoryService;
    private final ObjectMapper objectMapper;

    public ProductEventConsumer(InventoryService inventoryService, ObjectMapper objectMapper) {
        this.inventoryService = inventoryService;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = KafkaConstants.PRODUCT_EVENTS_TOPIC, groupId = "inventory-service-product-group")
    public void consumeProductEvents(String message, Acknowledgment ack) {
        log.info("Received product event: {}", message);
        try {
            BaseEvent<ProductCreatedPayload> event = objectMapper.readValue(message, new TypeReference<>() {
            });

            if (KafkaConstants.PRODUCT_CREATED_V1.equals(event.eventType())) {
                ProductCreatedPayload payload = event.payload();
                inventoryService.createInventory(payload.productId(), payload.initialQuantity());
            }

            ack.acknowledge();
        } catch (Exception e) {
            log.error("Error processing product event", e);
            // In a production environment, we might want to send this to a Dead Letter
            // Topic
        }
    }

    public record ProductCreatedPayload(String productId, Integer initialQuantity) {
    }
}
