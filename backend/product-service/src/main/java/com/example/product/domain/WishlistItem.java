package com.example.product.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "wishlist_items")
public class WishlistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", nullable = false)
    private String productId;

    // Snapshot details for quick display
    private String productName;
    private String productImage;
    private BigDecimal price;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wishlist_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Wishlist wishlist;

    public WishlistItem() {
    }

    public WishlistItem(Long id, String productId, String productName, String productImage, BigDecimal price,
            Wishlist wishlist) {
        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.productImage = productImage;
        this.price = price;
        this.wishlist = wishlist;
    }

    public static WishlistItemBuilder builder() {
        return new WishlistItemBuilder();
    }

    public static class WishlistItemBuilder {
        private Long id;
        private String productId;
        private String productName;
        private String productImage;
        private BigDecimal price;
        private Wishlist wishlist;

        public WishlistItemBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public WishlistItemBuilder productId(String productId) {
            this.productId = productId;
            return this;
        }

        public WishlistItemBuilder productName(String productName) {
            this.productName = productName;
            return this;
        }

        public WishlistItemBuilder productImage(String productImage) {
            this.productImage = productImage;
            return this;
        }

        public WishlistItemBuilder price(BigDecimal price) {
            this.price = price;
            return this;
        }

        public WishlistItemBuilder wishlist(Wishlist wishlist) {
            this.wishlist = wishlist;
            return this;
        }

        public WishlistItem build() {
            return new WishlistItem(id, productId, productName, productImage, price, wishlist);
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getProductImage() {
        return productImage;
    }

    public void setProductImage(String productImage) {
        this.productImage = productImage;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Wishlist getWishlist() {
        return wishlist;
    }

    public void setWishlist(Wishlist wishlist) {
        this.wishlist = wishlist;
    }
}
