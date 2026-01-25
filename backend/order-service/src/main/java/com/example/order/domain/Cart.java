package com.example.order.domain;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "carts")
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", unique = true, nullable = false)
    private String userId;

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CartItem> items = new ArrayList<>();

    public Cart() {
    }

    public Cart(Long id, String userId, List<CartItem> items) {
        this.id = id;
        this.userId = userId;
        this.items = items != null ? items : new ArrayList<>();
    }

    public static CartBuilder builder() {
        return new CartBuilder();
    }

    public static class CartBuilder {
        private Long id;
        private String userId;
        private List<CartItem> items;

        public CartBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public CartBuilder userId(String userId) {
            this.userId = userId;
            return this;
        }

        public CartBuilder items(List<CartItem> items) {
            this.items = items;
            return this;
        }

        public Cart build() {
            return new Cart(id, userId, items);
        }
    }

    public void addItem(CartItem item) {
        items.add(item);
        item.setCart(this);
    }

    public void removeItem(CartItem item) {
        items.remove(item);
        item.setCart(null);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public List<CartItem> getItems() {
        return items;
    }

    public void setItems(List<CartItem> items) {
        this.items = items;
    }
}
