package com.example.inventory.service;

import com.example.common.constants.KafkaConstants;
import com.example.common.event.BaseEvent;
import com.example.common.event.InventoryEvent;
import com.example.common.event.OrderCreatedEvent;
import com.example.inventory.domain.ProcessedEvent;
import com.example.inventory.repository.InventoryRepository;
import com.example.inventory.repository.ProcessedEventRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class InventoryService {
    private static final Logger log = LoggerFactory.getLogger(InventoryService.class);

    private final InventoryRepository inventoryRepository;
    private final ProcessedEventRepository processedEventRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public InventoryService(InventoryRepository inventoryRepository, 
                            ProcessedEventRepository processedEventRepository,
                            KafkaTemplate<String, String> kafkaTemplate,
                            ObjectMapper objectMapper) {
        this.inventoryRepository = inventoryRepository;
        this.processedEventRepository = processedEventRepository;
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public void processOrderCreated(BaseEvent<OrderCreatedEvent> event) {
        if (processedEventRepository.existsById(event.eventId())) {
            log.warn("Event {} already processed, skipping", event.eventId());
            return;
        }

        OrderCreatedEvent payload = event.payload();
        log.info("Processing inventory for order: {}", payload.orderId());

        // Simulate logic: Always succeed for now, or fail if productId is "fail-stock"
        boolean success = payload.items().stream()
                .noneMatch(item -> "fail-stock".equals(item.productId()));

        InventoryEvent.InventoryStatus status = success ? 
            InventoryEvent.InventoryStatus.RESERVED : InventoryEvent.InventoryStatus.FAILED;

        InventoryEvent inventoryEventPayload = new InventoryEvent(payload.orderId(), status);
        BaseEvent<InventoryEvent> responseEvent = BaseEvent.create(
            KafkaConstants.INVENTORY_EVENTS_TOPIC,
            inventoryEventPayload,
            event.correlationId()
        );

        try {
            kafkaTemplate.send(KafkaConstants.INVENTORY_EVENTS_TOPIC, payload.orderId(), 
                objectMapper.writeValueAsString(responseEvent));
            
            processedEventRepository.save(new ProcessedEvent(event.eventId(), LocalDateTime.now()));
            log.info("Inventory status {} published for order {}", status, payload.orderId());
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize inventory response", e);
            throw new RuntimeException(e);
        }
    }
}
