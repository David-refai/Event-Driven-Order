package com.example.product.domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "wishlists")
public class Wishlist {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", unique = true, nullable = false)
    private String userId;

    @OneToMany(mappedBy = "wishlist", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WishlistItem> items = new ArrayList<>();

    public Wishlist() {
    }

    public Wishlist(Long id, String userId, List<WishlistItem> items) {
        this.id = id;
        this.userId = userId;
        this.items = items != null ? items : new ArrayList<>();
    }

    public static WishlistBuilder builder() {
        return new WishlistBuilder();
    }

    public static class WishlistBuilder {
        private Long id;
        private String userId;
        private List<WishlistItem> items = new ArrayList<>();

        public WishlistBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public WishlistBuilder userId(String userId) {
            this.userId = userId;
            return this;
        }

        public WishlistBuilder items(List<WishlistItem> items) {
            this.items = items;
            return this;
        }

        public Wishlist build() {
            return new Wishlist(id, userId, items);
        }
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

    public List<WishlistItem> getItems() {
        return items;
    }

    public void setItems(List<WishlistItem> items) {
        this.items = items;
    }

    public void addItem(WishlistItem item) {
        items.add(item);
        item.setWishlist(this);
    }

    public void removeItem(WishlistItem item) {
        items.remove(item);
        item.setWishlist(null);
    }
}
