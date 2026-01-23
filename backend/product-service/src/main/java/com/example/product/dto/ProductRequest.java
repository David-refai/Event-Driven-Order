package com.example.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.util.List;

public record ProductRequest(
    @NotBlank(message = "Product name is required")
    String name,
    String description,
    @NotNull(message = "Price is required")
    @PositiveOrZero(message = "Price must be positive or zero")
    BigDecimal price,
    @NotNull(message = "Inventory quantity is required")
    @PositiveOrZero(message = "Inventory must be positive or zero")
    Integer inventory,
    List<String> images,
    Long categoryId
) {}
