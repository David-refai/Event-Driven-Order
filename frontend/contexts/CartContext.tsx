"use client";

import React, { createContext, useContext } from 'react';
import { Product } from '@/lib/api';
import { useCartQuery } from '@/hooks/useCartQuery';
import { CartItem } from '@/lib/api';

interface CartContextType {
    items: CartItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    cartTotal: number;
    isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const { cart, addToCart, removeFromCart, updateQuantity, clearCart, isLoading } = useCartQuery();

    const items = cart?.items || [];
    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const handleAddToCart = (product: Product) => {
        addToCart({
            productId: product.id,
            productName: product.name,
            productImage: product.images && product.images.length > 0 ? product.images[0] : '',
            price: product.price,
            quantity: 1
        });
    };

    const handleRemoveFromCart = (productId: string) => {
        removeFromCart(productId);
    };

    const handleUpdateQuantity = (productId: string, quantity: number) => {
        updateQuantity({ productId, quantity });
    };

    const handleClearCart = () => {
        clearCart();
    };

    return (
        <CartContext.Provider value={{
            items,
            addToCart: handleAddToCart,
            removeFromCart: handleRemoveFromCart,
            updateQuantity: handleUpdateQuantity,
            clearCart: handleClearCart,
            totalItems,
            cartTotal,
            isLoading
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
