package com.example.product.controller;

import com.example.product.domain.Wishlist;
import com.example.product.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    // Using X-User-Id header for simplicity as discussed
    @GetMapping
    public ResponseEntity<Wishlist> getWishlist(
            @RequestHeader(value = "X-User-Id") String userId) {
        return ResponseEntity.ok(wishlistService.getWishlist(userId));
    }

    @PostMapping("/items")
    public ResponseEntity<Wishlist> addItem(
            @RequestHeader(value = "X-User-Id") String userId,
            @RequestBody Map<String, Object> payload) {
        String productId = (String) payload.get("productId");
        String productName = (String) payload.get("productName");
        String productImage = (String) payload.get("productImage");
        BigDecimal price = new BigDecimal(payload.get("price").toString());

        return ResponseEntity.ok(wishlistService.addToWishlist(userId, productId, productName, productImage, price));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<Wishlist> removeItem(
            @RequestHeader(value = "X-User-Id", defaultValue = "test-user") String userId,
            @PathVariable String productId) {
        return ResponseEntity.ok(wishlistService.removeFromWishlist(userId, productId));
    }
}
