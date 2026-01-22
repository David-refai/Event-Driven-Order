package com.example.payment.consumer;

import com.example.common.constants.KafkaConstants;
import com.example.common.event.BaseEvent;
import com.example.common.event.OrderCreatedEvent;
import com.example.payment.service.PaymentService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

@Component
public class PaymentConsumer {
    private static final Logger log = LoggerFactory.getLogger(PaymentConsumer.class);

    private final PaymentService paymentService;
    private final ObjectMapper objectMapper;

    public PaymentConsumer(PaymentService paymentService, ObjectMapper objectMapper) {
        this.paymentService = paymentService;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = KafkaConstants.ORDER_EVENTS_TOPIC, groupId = "payment-service-group")
    public void consumeOrderCreated(String message, Acknowledgment ack) {
        log.info("Received order event in payment: {}", message);
        try {
            BaseEvent<OrderCreatedEvent> event = objectMapper.readValue(message, new TypeReference<>() {});
            paymentService.processOrderCreated(event);
            ack.acknowledge();
        } catch (Exception e) {
            log.error("Error processing order event in payment", e);
            throw new RuntimeException(e);
        }
    }
}
