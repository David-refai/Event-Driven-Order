package com.example.product.service;

import com.example.product.domain.Wishlist;
import com.example.product.domain.WishlistItem;
import com.example.product.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Service
@Transactional
public class WishlistService {

    private final WishlistRepository wishlistRepository;

    public WishlistService(WishlistRepository wishlistRepository) {
        this.wishlistRepository = wishlistRepository;
    }

    public Wishlist getWishlist(String userId) {
        return wishlistRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Wishlist wishlist = Wishlist.builder().userId(userId).build();
                    return wishlistRepository.save(wishlist);
                });
    }

    public Wishlist addToWishlist(String userId, String productId, String productName, String productImage,
            BigDecimal price) {
        Wishlist wishlist = getWishlist(userId);
        boolean exists = wishlist.getItems().stream()
                .anyMatch(item -> item.getProductId().equals(productId));

        if (!exists) {
            WishlistItem newItem = WishlistItem.builder()
                    .productId(productId)
                    .productName(productName)
                    .productImage(productImage)
                    .price(price)
                    .wishlist(wishlist)
                    .build();
            wishlist.addItem(newItem);
            return wishlistRepository.save(wishlist);
        }
        return wishlist;
    }

    public Wishlist removeFromWishlist(String userId, String productId) {
        Wishlist wishlist = getWishlist(userId);
        wishlist.getItems().removeIf(item -> item.getProductId().equals(productId));
        return wishlistRepository.save(wishlist);
    }
}
