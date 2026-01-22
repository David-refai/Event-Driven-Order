package com.example.order.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.util.List;

public class CreateOrderRequest {
    @NotNull
    private String customerId;
    @NotNull @Positive
    private BigDecimal totalAmount;
    @NotNull
    private String currency;
    @NotEmpty
    private List<OrderItemRequest> items;

    public static class OrderItemRequest {
        @NotNull
        private String productId;
        @NotNull @Positive
        private Integer quantity;

        public OrderItemRequest() {}
        
        public OrderItemRequest(String productId, Integer quantity) {
            this.productId = productId;
            this.quantity = quantity;
        }

        public String getProductId() { return productId; }
        public void setProductId(String productId) { this.productId = productId; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }

    public CreateOrderRequest() {}
    
    public CreateOrderRequest(String customerId, Double totalAmount, String currency, List<OrderItemRequest> items) {
        this.customerId = customerId;
        this.totalAmount = BigDecimal.valueOf(totalAmount);
        this.currency = currency;
        this.items = items;
    }

    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public List<OrderItemRequest> getItems() { return items; }
    public void setItems(List<OrderItemRequest> items) { this.items = items; }
}
