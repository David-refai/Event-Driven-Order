package com.example.inventory.repository;

import com.example.inventory.domain.ProductInventory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InventoryRepository extends JpaRepository<ProductInventory, String> {
}
