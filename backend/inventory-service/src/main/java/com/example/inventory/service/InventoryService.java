package com.example.inventory.service;

import com.example.common.event.BaseEvent;
import com.example.common.event.OrderCreatedEvent;
import com.example.inventory.domain.ProductInventory;
import com.example.inventory.repository.InventoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InventoryService {
    private static final Logger log = LoggerFactory.getLogger(InventoryService.class);
    private final InventoryRepository inventoryRepository;

    public InventoryService(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    @Transactional(readOnly = true)
    public ProductInventory getInventory(String productId) {
        return inventoryRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Inventory not found for product: " + productId));
    }

    @Transactional
    public void createInventory(String productId, Integer initialQuantity) {
        if (inventoryRepository.existsById(productId)) {
            log.warn("Inventory already exists for product: {}, skipping creation", productId);
            return;
        }
        ProductInventory inventory = new ProductInventory(productId, initialQuantity);
        inventoryRepository.save(inventory);
        log.info("Initialized inventory for product: {} with quantity: {}", productId, initialQuantity);
    }

    @Transactional
    public void setInventory(String productId, Integer quantity) {
        ProductInventory inventory = inventoryRepository.findById(productId)
                .orElseGet(() -> new ProductInventory(productId, 0));
        inventory.setAvailableQuantity(quantity);
        inventoryRepository.save(inventory);
        log.info("Reset inventory for product: {} to quantity: {}", productId, quantity);
    }

    @Transactional
    public void processOrderCreated(BaseEvent<OrderCreatedEvent> event) {
        log.info("Processing order created event in inventory: {}", event.eventId());
        event.payload().items().forEach(item -> {
            updateStock(item.productId(), -item.quantity());
        });
    }

    @Transactional
    public void updateStock(String productId, Integer quantityChange) {
        ProductInventory inventory = getInventory(productId);
        int newQuantity = inventory.getAvailableQuantity() + quantityChange;
        if (newQuantity < 0) {
            throw new RuntimeException("Insufficient stock for product: " + productId);
        }
        inventory.setAvailableQuantity(newQuantity);
        inventoryRepository.save(inventory);
        log.info("Updated stock for product: {}. New quantity: {}", productId, newQuantity);
    }
}
