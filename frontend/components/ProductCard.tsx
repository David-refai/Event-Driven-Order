"use client";

import React, { useState, useEffect } from 'react';
import { Product } from '@/lib/api';
import { ShoppingCart, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge'; // Assuming badge exists or will create

export default function ProductCard({ product }: { product: Product }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const images = product.images.length > 0 ? product.images : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop'];

    // Auto carousel effect
    useEffect(() => {
        if (images.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }, 3000); // Change image every 3 seconds

        return () => clearInterval(interval);
    }, [images.length]);

    const nextImage = (e: React.MouseEvent) => {
        e.preventDefault();
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.preventDefault();
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className="group relative bg-gray-900/40 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden hover:border-blue-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2">
            {/* Image Section */}
            <div className="relative aspect-[4/5] overflow-hidden">
                {images.map((img, idx) => (
                    <img
                        key={idx}
                        src={img}
                        alt={product.name}
                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out ${idx === currentImageIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
                            }`}
                    />
                ))}

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-60" />

                {/* Tags */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <div className="bg-blue-600/90 backdrop-blur-md text-[10px] font-bold text-white px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                        {product.category?.name || 'New Arrival'}
                    </div>
                </div>

                {/* Rating */}
                <div className="absolute top-4 right-4 bg-gray-950/60 backdrop-blur-md rounded-full px-2 py-1 flex items-center gap-1 border border-white/10">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-[10px] font-bold text-white">4.9</span>
                </div>

                {/* Navigation Arrows (Visible on hover) */}
                {images.length > 1 && (
                    <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                            onClick={prevImage}
                            className="p-2 rounded-full bg-gray-900/80 backdrop-blur-md border border-white/10 text-white hover:bg-blue-600 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={nextImage}
                            className="p-2 rounded-full bg-gray-900/80 backdrop-blur-md border border-white/10 text-white hover:bg-blue-600 transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Carousel Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'w-6 bg-blue-500' : 'w-2 bg-white/30'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Content Section */}
            <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-white truncate group-hover:text-blue-400 transition-colors">{product.name}</h3>
                    <p className="text-xl font-black text-white">${product.price}</p>
                </div>

                <p className="text-sm text-gray-500 line-clamp-2 mb-6 leading-relaxed">
                    {product.description}
                </p>

                <div className="flex items-center gap-3">
                    <button className="flex-1 bg-white text-black h-12 rounded-2xl font-bold text-sm hover:bg-blue-500 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2">
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart
                    </button>
                    <button className="w-12 h-12 rounded-2xl border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
