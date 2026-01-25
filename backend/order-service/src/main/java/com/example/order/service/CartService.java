package com.example.order.service;

import com.example.order.domain.Cart;
import com.example.order.domain.CartItem;
import com.example.order.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Service
@Transactional
public class CartService {

    private final CartRepository cartRepository;

    public CartService(CartRepository cartRepository) {
        this.cartRepository = cartRepository;
    }

    public Cart getCart(String userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart cart = Cart.builder().userId(userId).build();
                    return cartRepository.save(cart);
                });
    }

    public Cart addItemToCart(String userId, String productId, String productName, String productImage,
            BigDecimal price, int quantity) {
        Cart cart = getCart(userId);
        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(productId))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
            // Update snapshot details in case they changed (optional)
            item.setPrice(price);
            item.setProductName(productName);
            item.setProductImage(productImage);
        } else {
            CartItem newItem = CartItem.builder()
                    .productId(productId)
                    .productName(productName)
                    .productImage(productImage)
                    .price(price)
                    .quantity(quantity)
                    .cart(cart)
                    .build();
            cart.addItem(newItem);
        }

        return cartRepository.save(cart);
    }

    public Cart removeItemFromCart(String userId, String productId) {
        Cart cart = getCart(userId);
        cart.getItems().removeIf(item -> item.getProductId().equals(productId));
        return cartRepository.save(cart);
    }

    public void clearCart(String userId) {
        Cart cart = getCart(userId);
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    public Cart updateItemQuantity(String userId, String productId, int quantity) {
        if (quantity <= 0) {
            return removeItemFromCart(userId, productId);
        }

        Cart cart = getCart(userId);
        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(productId))
                .findFirst();

        if (existingItem.isPresent()) {
            existingItem.get().setQuantity(quantity);
            return cartRepository.save(cart);
        }

        throw new RuntimeException("Item not found in cart");
    }
}
