package com.example.order.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderResponse {
    private String orderId;
    private String customerId;
    private String status;
    private BigDecimal totalAmount;
    private String currency;
    private LocalDateTime createdAt;
    private List<OrderItemResponse> items;

    public static class OrderItemResponse {
        private String productId;
        private String productName;
        private java.math.BigDecimal unitPrice;
        private Integer quantity;

        public OrderItemResponse(String productId, String productName, java.math.BigDecimal unitPrice,
                Integer quantity) {
            this.productId = productId;
            this.productName = productName;
            this.unitPrice = unitPrice;
            this.quantity = quantity;
        }

        public String getProductId() {
            return productId;
        }

        public String getProductName() {
            return productName;
        }

        public java.math.BigDecimal getUnitPrice() {
            return unitPrice;
        }

        public Integer getQuantity() {
            return quantity;
        }
    }

    private OrderResponse(Builder builder) {
        this.orderId = builder.orderId;
        this.customerId = builder.customerId;
        this.status = builder.status;
        this.totalAmount = builder.totalAmount;
        this.currency = builder.currency;
        this.createdAt = builder.createdAt;
        this.items = builder.items;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String orderId;
        private String customerId;
        private String status;
        private BigDecimal totalAmount;
        private String currency;
        private LocalDateTime createdAt;
        private List<OrderItemResponse> items;

        public Builder orderId(String orderId) {
            this.orderId = orderId;
            return this;
        }

        public Builder customerId(String customerId) {
            this.customerId = customerId;
            return this;
        }

        public Builder status(String status) {
            this.status = status;
            return this;
        }

        public Builder totalAmount(BigDecimal totalAmount) {
            this.totalAmount = totalAmount;
            return this;
        }

        public Builder currency(String currency) {
            this.currency = currency;
            return this;
        }

        public Builder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public Builder items(List<OrderItemResponse> items) {
            this.items = items;
            return this;
        }

        public OrderResponse build() {
            return new OrderResponse(this);
        }
    }

    public String getOrderId() {
        return orderId;
    }

    public String getCustomerId() {
        return customerId;
    }

    public String getStatus() {
        return status;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public String getCurrency() {
        return currency;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public List<OrderItemResponse> getItems() {
        return items;
    }
}
