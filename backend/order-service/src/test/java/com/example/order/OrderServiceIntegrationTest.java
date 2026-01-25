package com.example.order;

import com.example.common.event.OrderCreatedEvent;
import com.example.order.dto.CreateOrderRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.test.utils.KafkaTestUtils;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.kafka.test.EmbeddedKafkaBroker;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Duration;
import java.util.Collections;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@EmbeddedKafka(partitions = 1, brokerProperties = { "listeners=PLAINTEXT://localhost:9092", "port=9092" })
public class OrderServiceIntegrationTest {

        @Autowired
        private EmbeddedKafkaBroker embeddedKafkaBroker;

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @Autowired
        private com.example.order.publisher.OutboxPublisher outboxPublisher;

        @Autowired
        private com.example.order.repository.OutboxRepository outboxRepository;

        @Test
        @WithMockUser(username = "testuser", roles = { "USER" })
        void shouldCreateOrderAndPublishEvent() throws Exception {
                // Given: A valid order request
                CreateOrderRequest request = new CreateOrderRequest(
                                "TEST-CUSTOMER",
                                250.00,
                                "USD",
                                Collections.singletonList(new CreateOrderRequest.OrderItemRequest("PROD-1",
                                                "Test Product", java.math.BigDecimal.valueOf(125.0), 2)));

                // Create Kafka consumer to verify event publication
                Map<String, Object> consumerProps = KafkaTestUtils.consumerProps(
                                embeddedKafkaBroker.getBrokersAsString(),
                                "test-group",
                                "true");
                consumerProps.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");

                Consumer<String, String> consumer = new DefaultKafkaConsumerFactory<>(
                                consumerProps,
                                new StringDeserializer(),
                                new StringDeserializer()).createConsumer();

                consumer.subscribe(Collections.singletonList("orders.events"));

                // When: We create an order
                String result = mockMvc.perform(post("/api/orders")
                                .header("X-API-KEY", "secret-api-key")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.orderId").isNotEmpty())
                                .andReturn()
                                .getResponse()
                                .getContentAsString();

                // Manually trigger outbox publication
                outboxPublisher.publishEvents();

                outboxRepository.findAll().forEach(o -> System.out
                                .println("Outbox event after: " + o.getEventType() + " sent: " + o.isSent()));

                // Wait for Kafka to process the message
                Thread.sleep(2000);

                String orderId = objectMapper.readTree(result).get("orderId").asText();

                // Then: Event should be published to Kafka
                ConsumerRecord<String, String> record = KafkaTestUtils.getSingleRecord(
                                consumer,
                                "orders.events",
                                Duration.ofSeconds(10));

                assertThat(record).isNotNull();
                assertThat(record.value()).contains(orderId);
                assertThat(record.value()).contains("OrderCreated");

                consumer.close();
        }
}
