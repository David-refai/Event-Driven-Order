package com.example.common.constants;

public class KafkaConstants {
    public static final String ORDER_EVENTS_TOPIC = "orders.events";
    public static final String INVENTORY_EVENTS_TOPIC = "inventory.events";
    public static final String PAYMENT_EVENTS_TOPIC = "payment.events";
    public static final String PRODUCT_EVENTS_TOPIC = "products.events";
    public static final String NOTIFICATION_EVENTS_TOPIC = "notifications.events";

    public static final String ORDER_CREATED_V1 = "OrderCreatedEvent_V1";
    public static final String INVENTORY_STATUS_V1 = "InventoryStatusEvent_V1";
    public static final String PRODUCT_CREATED_V1 = "ProductCreatedEvent_V1";
    public static final String PAYMENT_STATUS_V1 = "PaymentStatusEvent_V1";
}
