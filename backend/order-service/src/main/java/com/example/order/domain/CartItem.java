package com.example.order.domain;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "cart_items")
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", nullable = false)
    private String productId;

    @Column(nullable = false)
    private String productName;

    private String productImage;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(nullable = false)
    private Integer quantity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Cart cart;

    public CartItem() {
    }

    public CartItem(Long id, String productId, String productName, String productImage, BigDecimal price,
            Integer quantity, Cart cart) {
        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.productImage = productImage;
        this.price = price;
        this.quantity = quantity;
        this.cart = cart;
    }

    public static CartItemBuilder builder() {
        return new CartItemBuilder();
    }

    public static class CartItemBuilder {
        private Long id;
        private String productId;
        private String productName;
        private String productImage;
        private BigDecimal price;
        private Integer quantity;
        private Cart cart;

        public CartItemBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public CartItemBuilder productId(String productId) {
            this.productId = productId;
            return this;
        }

        public CartItemBuilder productName(String productName) {
            this.productName = productName;
            return this;
        }

        public CartItemBuilder productImage(String productImage) {
            this.productImage = productImage;
            return this;
        }

        public CartItemBuilder price(BigDecimal price) {
            this.price = price;
            return this;
        }

        public CartItemBuilder quantity(Integer quantity) {
            this.quantity = quantity;
            return this;
        }

        public CartItemBuilder cart(Cart cart) {
            this.cart = cart;
            return this;
        }

        public CartItem build() {
            return new CartItem(id, productId, productName, productImage, price, quantity, cart);
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

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Cart getCart() {
        return cart;
    }

    public void setCart(Cart cart) {
        this.cart = cart;
    }
}
