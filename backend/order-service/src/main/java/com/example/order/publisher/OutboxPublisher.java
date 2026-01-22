package com.example.order.publisher;

import com.example.common.constants.KafkaConstants;
import com.example.order.domain.Outbox;
import com.example.order.repository.OutboxRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
public class OutboxPublisher {
    private static final Logger log = LoggerFactory.getLogger(OutboxPublisher.class);

    private final OutboxRepository outboxRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;

    public OutboxPublisher(OutboxRepository outboxRepository, KafkaTemplate<String, String> kafkaTemplate) {
        this.outboxRepository = outboxRepository;
        this.kafkaTemplate = kafkaTemplate;
    }

    @Scheduled(fixedDelay = 5000)
    @Transactional
    public void publishEvents() {
        List<Outbox> unsentEvents = outboxRepository.findBySentFalse();
        if (!unsentEvents.isEmpty()) {
            log.info("Found {} unsent outbox events", unsentEvents.size());
        }

        for (Outbox outbox : unsentEvents) {
            try {
                kafkaTemplate.send(KafkaConstants.ORDER_EVENTS_TOPIC, outbox.getAggregateId(), outbox.getPayload());
                outbox.setSent(true);
                outboxRepository.save(outbox);
                log.info("Published event type {} for aggregate {}", outbox.getEventType(), outbox.getAggregateId());
            } catch (Exception e) {
                log.error("Failed to publish outbox event {}", outbox.getId(), e);
            }
        }
    }
}
