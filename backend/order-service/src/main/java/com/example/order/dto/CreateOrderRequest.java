package com.example.order.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.util.List;

public class CreateOrderRequest {
    @NotNull
    private String customerId;
    @NotNull
    @Positive
    private BigDecimal totalAmount;
    @NotNull
    private String currency;
    @NotEmpty
    private List<OrderItemRequest> items;

    public static class OrderItemRequest {
        @NotNull
        private String productId;
        @NotNull
        private String productName;
        @NotNull
        @Positive
        private java.math.BigDecimal unitPrice;
        @NotNull
        @Positive
        private Integer quantity;

        public OrderItemRequest() {
        }

        public OrderItemRequest(String productId, String productName, java.math.BigDecimal unitPrice,
                Integer quantity) {
            this.productId = productId;
            this.productName = productName;
            this.unitPrice = unitPrice;
            this.quantity = quantity;
        }

        public String getProductId() {
            return productId;
        }

        public void setProductId(String productId) {
            this.productId = productId;
        }

        public String getProductName() {
            return productName;
        }

        public void setProductName(String productName) {
            this.productName = productName;
        }

        public java.math.BigDecimal getUnitPrice() {
            return unitPrice;
        }

        public void setUnitPrice(java.math.BigDecimal unitPrice) {
            this.unitPrice = unitPrice;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }
    }

    public CreateOrderRequest() {
    }

    public CreateOrderRequest(String customerId, Double totalAmount, String currency, List<OrderItemRequest> items) {
        this.customerId = customerId;
        this.totalAmount = BigDecimal.valueOf(totalAmount);
        this.currency = currency;
        this.items = items;
    }

    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public List<OrderItemRequest> getItems() {
        return items;
    }

    public void setItems(List<OrderItemRequest> items) {
        this.items = items;
    }
}
