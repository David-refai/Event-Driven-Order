package com.example.notification.consumer;

import com.example.common.constants.KafkaConstants;
import com.example.common.event.BaseEvent;
import com.example.common.event.PaymentEvent;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class NotificationConsumer {
    private static final Logger log = LoggerFactory.getLogger(NotificationConsumer.class);

    private final ObjectMapper objectMapper;

    public NotificationConsumer(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = KafkaConstants.PAYMENT_EVENTS_TOPIC, groupId = "notification-service-group")
    public void consumePaymentEvent(String message) {
        log.info("Received payment event in notification: {}", message);
        try {
            BaseEvent<PaymentEvent> event = objectMapper.readValue(message, new TypeReference<>() {});
            PaymentEvent payload = event.payload();

            if (payload.status() == PaymentEvent.PaymentStatus.SUCCEEDED) {
                sendEmail(payload.orderId(), "Order Successful", "Your order has been paid and is being processed.");
            } else {
                sendEmail(payload.orderId(), "Order Failed", "Payment for your order failed.");
            }
        } catch (Exception e) {
            log.error("Error processing payment event in notification", e);
        }
    }

    private void sendEmail(String orderId, String subject, String body) {
        log.info("------------------------------------------------");
        log.info("SENDING EMAIL (Mock)");
        log.info("Order ID: {}", orderId);
        log.info("Subject: {}", subject);
        log.info("Body: {}", body);
        log.info("------------------------------------------------");
    }
}
