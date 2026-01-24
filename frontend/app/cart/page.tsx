"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, Package } from 'lucide-react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from '@/lib/config';

export default function CartPage() {
    const { items, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();

    const shippingCost = items.length > 0 ? (cartTotal > 500 ? 0 : 25) : 0;
    const tax = cartTotal * 0.15; // 15% tax example
    const finalTotal = cartTotal + shippingCost + tax;

    if (items.length === 0) {
        return (
            <main className="min-h-screen bg-gray-950 text-white font-outfit">
                <Navbar />
                <div className="pt-32 px-6 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 animate-pulse">
                        <ShoppingBag className="w-10 h-10 text-gray-500" />
                    </div>
                    <h1 className="text-3xl font-black mb-4">Your Cart is Empty</h1>
                    <p className="text-gray-400 mb-8 max-w-md">Looks like you haven&apos;t added anything to your cart yet. Discover our premium collection today.</p>
                    <Link href="/products">
                        <Button className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-[20px] font-bold shadow-lg shadow-blue-500/20">
                            Start Shopping
                        </Button>
                    </Link>
                </div>
                <Footer />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-950 text-white font-outfit selection:bg-blue-500/30">
            <Navbar />

            <div className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-black mb-12 flex items-center gap-4">
                        Shopping Cart
                        <span className="text-lg font-medium text-gray-500 bg-white/5 px-3 py-1 rounded-full">{items.length} items</span>
                    </h1>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Cart Items List */}
                        <div className="lg:col-span-2 space-y-6">
                            {items.map((item) => (
                                <div key={item.id} className="group relative bg-white/[0.02] border border-white/5 rounded-3xl p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-6 hover:border-white/10 transition-colors">
                                    {/* Image */}
                                    <div className="w-full sm:w-32 h-32 bg-white/5 rounded-2xl overflow-hidden flex-shrink-0 border border-white/5">
                                        <img
                                            src={item.productImage && item.productImage.startsWith('http')
                                                ? item.productImage
                                                : `${API_BASE_URL}${item.productImage || ''}`}
                                            alt={item.productName}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 text-center sm:text-left w-full">
                                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
                                            <div>
                                                <h3 className="text-lg font-bold text-white leading-tight mb-1">{item.productName}</h3>
                                                {/* Category removed as not in snapshot */}
                                            </div>
                                            <p className="text-xl font-black text-white">${(item.price * item.quantity).toFixed(2)}</p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center justify-between sm:justify-start gap-6 mt-4">
                                            {/* Quantity Control */}
                                            <div className="flex items-center gap-3 bg-gray-900 rounded-xl p-1 border border-white/10">
                                                <button
                                                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>

                                            {/* Remove */}
                                            <button
                                                onClick={() => removeFromCart(item.productId)}
                                                className="p-2 text-gray-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl transition-all"
                                                title="Remove item"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={clearCart}
                                    className="text-sm font-bold text-rose-400 hover:text-rose-300 transition-colors uppercase tracking-widest"
                                >
                                    Clear Cart
                                </button>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                                <h2 className="text-xl font-black mb-8">Order Summary</h2>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between text-gray-400 text-sm">
                                        <span>Subtotal</span>
                                        <span className="text-white font-bold">${cartTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-400 text-sm">
                                        <span>Shipping</span>
                                        <span className="text-white font-bold">{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-400 text-sm">
                                        <span>Tax (15%)</span>
                                        <span className="text-white font-bold">${tax.toFixed(2)}</span>
                                    </div>
                                    <div className="h-px bg-white/10 my-4" />
                                    <div className="flex justify-between items-end">
                                        <span className="text-gray-300 font-bold">Total</span>
                                        <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                                            ${finalTotal.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                <Button className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-[20px] font-black text-lg shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 group">
                                    Proceed to Checkout
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Button>

                                <p className="text-xs text-center text-gray-500 mt-6 flex items-center justify-center gap-2">
                                    <Package className="w-3 h-3" />
                                    Secure Checkout by EventFlow
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
