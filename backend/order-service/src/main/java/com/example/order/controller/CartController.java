package com.example.order.controller;

import com.example.order.domain.Cart;
import com.example.order.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    // In a real app, get userId from Principal/SecurityContext
    // For demo, we might pass it as header or query param, or mock it?
    // Let's assume we pass X-User-Id header for simplicity if Auth not fully wired,
    // or usage of SecurityContextHolder.
    // Given previous `auth-service` and `Navbar`, let's try to get it from header
    // for now.

    @GetMapping
    public ResponseEntity<Cart> getCart(@RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(cartService.getCart(userId));
    }

    @PostMapping("/items")
    public ResponseEntity<Cart> addItem(@RequestHeader(value = "X-User-Id", defaultValue = "test-user") String userId,
            @RequestBody Map<String, Object> payload) {
        String productId = (String) payload.get("productId");
        String productName = (String) payload.get("productName");
        String productImage = (String) payload.get("productImage");
        BigDecimal price = new BigDecimal(payload.get("price").toString());
        int quantity = (int) payload.get("quantity");

        return ResponseEntity
                .ok(cartService.addItemToCart(userId, productId, productName, productImage, price, quantity));
    }

    @PutMapping("/items/{productId}")
    public ResponseEntity<Cart> updateItemQuantity(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String productId,
            @RequestBody Map<String, Integer> payload) {
        int quantity = payload.get("quantity");
        return ResponseEntity.ok(cartService.updateItemQuantity(userId, productId, quantity));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<Cart> removeItem(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String productId) {
        return ResponseEntity.ok(cartService.removeItemFromCart(userId, productId));
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(
            @RequestHeader(value = "X-User-Id", defaultValue = "test-user") String userId) {
        cartService.clearCart(userId);
        return ResponseEntity.ok().build();
    }
}
