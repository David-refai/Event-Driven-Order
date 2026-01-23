package com.example.inventory.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "product_inventory")
public class ProductInventory {
    @Id
    private String productId;
    private Integer availableQuantity;

    public ProductInventory() {
    }

    public ProductInventory(String productId, Integer availableQuantity) {
        this.productId = productId;
        this.availableQuantity = availableQuantity;
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public Integer getAvailableQuantity() {
        return availableQuantity;
    }

    public void setAvailableQuantity(Integer availableQuantity) {
        this.availableQuantity = availableQuantity;
    }
}
