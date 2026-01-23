package com.example.analytics.consumer;

import com.example.analytics.domain.EventStat;
import com.example.analytics.repository.EventStatRepository;
import com.example.common.constants.KafkaConstants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class AnalyticsConsumer {
    private static final Logger log = LoggerFactory.getLogger(AnalyticsConsumer.class);

    private final EventStatRepository repository;

    public AnalyticsConsumer(EventStatRepository repository) {
        this.repository = repository;
    }

    @KafkaListener(topics = {
            KafkaConstants.ORDER_EVENTS_TOPIC,
            KafkaConstants.INVENTORY_EVENTS_TOPIC,
            KafkaConstants.PAYMENT_EVENTS_TOPIC,
            KafkaConstants.PRODUCT_EVENTS_TOPIC
    }, groupId = "analytics-service-group")
    @Transactional
    public void consumeAllEvents(String message,
            @org.springframework.messaging.handler.annotation.Header(org.springframework.kafka.support.KafkaHeaders.RECEIVED_TOPIC) String topic) {
        log.info("Analytics received event from topic: {}", topic);

        EventStat stat = repository.findById(topic)
                .orElse(new EventStat(topic, 0L));

        stat.setCount(stat.getCount() + 1);
        repository.save(stat);
    }
}
