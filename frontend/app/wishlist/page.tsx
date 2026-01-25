"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useWishlistQuery } from '@/hooks/useWishlistQuery';
import { useCartQuery } from '@/hooks/useCartQuery';
import { Trash2, ShoppingCart, Heart } from 'lucide-react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from '@/lib/config';
import { getImageUrl } from '@/lib/utils';

export default function WishlistPage() {
    const { wishlist, removeFromWishlist } = useWishlistQuery();
    const { addToCart } = useCartQuery();

    const items = wishlist?.items || [];

    const handleAddToCart = (item: any) => {
        addToCart({
            productId: item.productId,
            productName: item.productName,
            productImage: item.productImage,
            price: item.price,
            quantity: 1
        });
    };

    if (items.length === 0) {
        return (
            <main className="min-h-screen bg-gray-950 text-white font-outfit">
                <Navbar />
                <div className="pt-32 px-6 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 animate-pulse">
                        <Heart className="w-10 h-10 text-rose-500" />
                    </div>
                    <h1 className="text-3xl font-black mb-4">Your Wishlist is Empty</h1>
                    <p className="text-gray-400 mb-8 max-w-md">Save items you love here to purchase them later.</p>
                    <Link href="/products">
                        <Button className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-[20px] font-bold shadow-lg shadow-blue-500/20">
                            Explore Products
                        </Button>
                    </Link>
                </div>
                <Footer />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-950 text-white font-outfit selection:bg-rose-500/30">
            <Navbar />

            <div className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-black mb-12 flex items-center gap-4">
                        My Wishlist
                        <span className="text-lg font-medium text-gray-500 bg-white/5 px-3 py-1 rounded-full">{items.length} items</span>
                    </h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {items.map((item) => (
                            <div key={item.id} className="group relative bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden hover:border-rose-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-rose-500/10">
                                {/* Image */}
                                <div className="aspect-[4/5] relative overflow-hidden bg-gray-900">
                                    <img
                                        src={getImageUrl(item.productImage)}
                                        alt={item.productName}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-60" />

                                    <button
                                        onClick={() => removeFromWishlist(item.productId)}
                                        className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-rose-500 hover:text-white transition-colors border border-white/10"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <h3 className="text-lg font-bold text-white mb-1 truncate">{item.productName}</h3>
                                    <p className="text-xl font-black text-white mb-6">${item.price}</p>

                                    <Button
                                        onClick={() => handleAddToCart(item)}
                                        className="w-full h-12 bg-white text-black hover:bg-blue-500 hover:text-white rounded-[16px] font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <ShoppingCart className="w-4 h-4" />
                                        Add to Cart
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
