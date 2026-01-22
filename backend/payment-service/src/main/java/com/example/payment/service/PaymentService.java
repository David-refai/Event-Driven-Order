package com.example.payment.service;

import com.example.common.constants.KafkaConstants;
import com.example.common.event.BaseEvent;
import com.example.common.event.OrderCreatedEvent;
import com.example.common.event.PaymentEvent;
import com.example.payment.domain.ProcessedEvent;
import com.example.payment.repository.ProcessedEventRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class PaymentService {
    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final ProcessedEventRepository processedEventRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public PaymentService(ProcessedEventRepository processedEventRepository,
                          KafkaTemplate<String, String> kafkaTemplate,
                          ObjectMapper objectMapper) {
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
        log.info("Processing payment for order: {}. Amount: {}", payload.orderId(), payload.totalAmount());

        // Simple simulation: fail if amount > 500
        boolean success = payload.totalAmount().compareTo(new BigDecimal("500")) <= 0;

        PaymentEvent.PaymentStatus status = success ? 
            PaymentEvent.PaymentStatus.SUCCEEDED : PaymentEvent.PaymentStatus.FAILED;

        PaymentEvent paymentEventPayload = new PaymentEvent(payload.orderId(), status);
        BaseEvent<PaymentEvent> responseEvent = BaseEvent.create(
            KafkaConstants.PAYMENT_EVENTS_TOPIC,
            paymentEventPayload,
            event.correlationId()
        );

        try {
            kafkaTemplate.send(KafkaConstants.PAYMENT_EVENTS_TOPIC, payload.orderId(),
                objectMapper.writeValueAsString(responseEvent));
            
            processedEventRepository.save(new ProcessedEvent(event.eventId(), LocalDateTime.now()));
            log.info("Payment status {} published for order {}", status, payload.orderId());
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize payment response", e);
            throw new RuntimeException(e);
        }
    }
}
