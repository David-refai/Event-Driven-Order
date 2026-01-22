package com.example.order.service;

import com.example.common.constants.KafkaConstants;
import com.example.common.event.BaseEvent;
import com.example.common.event.OrderCreatedEvent;
import com.example.common.utils.CorrelationIdUtils;
import com.example.order.domain.Order;
import com.example.order.domain.OrderItem;
import com.example.order.domain.Outbox;
import com.example.order.dto.CreateOrderRequest;
import com.example.order.dto.OrderResponse;
import com.example.order.repository.OrderRepository;
import com.example.order.repository.OutboxRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {
    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final OutboxRepository outboxRepository;
    private final ObjectMapper objectMapper;

    public OrderService(OrderRepository orderRepository, OutboxRepository outboxRepository, ObjectMapper objectMapper) {
        this.orderRepository = orderRepository;
        this.outboxRepository = outboxRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        String correlationId = CorrelationIdUtils.getCorrelationId();
        log.info("Creating order for customer: {}", request.getCustomerId());

        Order order = new Order();
        order.setId(UUID.randomUUID().toString());
        order.setCustomerId(request.getCustomerId());
        order.setStatus(Order.OrderStatus.CREATED);
        order.setTotalAmount(request.getTotalAmount());
        order.setCurrency(request.getCurrency());
        order.setCreatedAt(LocalDateTime.now());

        order.setItems(request.getItems().stream().map(itemReq -> {
            OrderItem item = new OrderItem();
            item.setProductId(itemReq.getProductId());
            item.setQuantity(itemReq.getQuantity());
            item.setOrder(order);
            return item;
        }).collect(Collectors.toList()));

        orderRepository.save(order);

        // Prepare OrderCreatedEvent payload
        OrderCreatedEvent eventPayload = new OrderCreatedEvent(
                order.getId(),
                order.getCustomerId(),
                order.getTotalAmount(),
                order.getCurrency(),
                order.getItems().stream()
                        .map(i -> new OrderCreatedEvent.OrderItemPayload(i.getProductId(), i.getQuantity()))
                        .collect(Collectors.toList()));

        BaseEvent<OrderCreatedEvent> event = BaseEvent.create(
                KafkaConstants.ORDER_CREATED_V1,
                eventPayload,
                correlationId);

        try {
            Outbox outbox = new Outbox();
            outbox.setAggregateId(order.getId());
            outbox.setEventType(KafkaConstants.ORDER_CREATED_V1);
            outbox.setPayload(objectMapper.writeValueAsString(event));
            outbox.setCreatedAt(LocalDateTime.now());
            outbox.setSent(false);
            outboxRepository.save(outbox);
            log.info("Saved outbox event for order: {}", order.getId());
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize order event", e);
        }

        return getOrder(order.getId());
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrder(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        return OrderResponse.builder()
                .orderId(order.getId())
                .customerId(order.getCustomerId())
                .status(order.getStatus().name())
                .totalAmount(order.getTotalAmount())
                .currency(order.getCurrency())
                .createdAt(order.getCreatedAt())
                .items(order.getItems().stream()
                        .map(i -> new OrderResponse.OrderItemResponse(i.getProductId(), i.getQuantity()))
                        .collect(Collectors.toList()))
                .build();
    }

    @Transactional(readOnly = true)
    public java.util.List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(order -> OrderResponse.builder()
                        .orderId(order.getId())
                        .customerId(order.getCustomerId())
                        .status(order.getStatus().name())
                        .totalAmount(order.getTotalAmount())
                        .currency(order.getCurrency())
                        .createdAt(order.getCreatedAt())
                        .items(order.getItems().stream()
                                .map(i -> new OrderResponse.OrderItemResponse(i.getProductId(), i.getQuantity()))
                                .collect(Collectors.toList()))
                        .build())
                .collect(Collectors.toList());
    }
}
