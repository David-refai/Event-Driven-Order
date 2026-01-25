"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { apiClient, Product } from '@/lib/api';
import { API_BASE_URL } from '@/lib/config';
import { ArrowLeft, ShoppingCart, Shield, Truck, RefreshCw, Star, Layers, Package, Heart } from 'lucide-react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { getImageUrl } from '@/lib/utils';

import { useParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useWishlistQuery } from '@/hooks/useWishlistQuery';

export default function ProductDetailPage() {
    const params = useParams();
    const id = params?.id as string;
    const { addToCart } = useCart();
    const { wishlist, addToWishlist, removeFromWishlist } = useWishlistQuery();

    const isWishlisted = wishlist?.items?.some(item => item.productId === id);

    const toggleWishlist = () => {
        if (!product) return;
        if (isWishlisted) {
            removeFromWishlist(id);
        } else {
            addToWishlist({
                productId: product.id,
                productName: product.name,
                productImage: product.images && product.images.length > 0 ? product.images[0] : '',
                price: product.price
            });
        }
    };

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchProduct = async () => {
            try {
                const data = await apiClient.getProduct(id);
                setProduct(data);
                if (data.images && data.images.length > 0) {
                    setSelectedImage(data.images[0]);
                }
            } catch (error) {
                console.error('Failed to fetch product:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-950 text-white font-outfit">
                <Navbar />
                <div className="pt-32 px-6 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                        <p className="text-gray-500 font-bold tracking-widest uppercase text-sm animate-pulse">Loading Asset...</p>
                    </div>
                </div>
                <Footer />
            </main>
        );
    }

    if (!product) {
        return (
            <main className="min-h-screen bg-gray-950 text-white font-outfit">
                <Navbar />
                <div className="pt-32 px-6 max-w-7xl mx-auto text-center min-h-[60vh] flex flex-col justify-center items-center">
                    <h1 className="text-4xl font-black mb-4">Asset Not Found</h1>
                    <p className="text-gray-400 mb-8 max-w-md">The product you are looking for has been moved or removed from our inventory.</p>
                    <Link href="/products">
                        <Button className="h-12 px-8 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-[20px] font-bold">
                            Return to Catalog
                        </Button>
                    </Link>
                </div>
                <Footer />
            </main>
        );
    }

    const inventory = product.inventory || 0;
    const isLowStock = inventory > 0 && inventory < 10;
    const isOutOfStock = inventory === 0;

    return (
        <main className="min-h-screen bg-gray-950 text-white font-outfit selection:bg-blue-500/30">
            <Navbar />

            <div className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Breadcrumbs / Back */}
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-white transition-colors mb-8 group"
                    >
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                            <ArrowLeft className="w-4 h-4 text-gray-400 group-hover:text-white" />
                        </div>
                        Back to Catalog
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        {/* Left: Gallery */}
                        <div className="space-y-6">
                            {/* Main Image */}
                            <div className="aspect-square w-full bg-white/5 rounded-[40px] border border-white/10 overflow-hidden relative group">
                                {selectedImage ? (
                                    <img
                                        src={getImageUrl(selectedImage)}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                        <Package className="w-20 h-20 text-gray-800" />
                                    </div>
                                )}
                                {product.category && (
                                    <div className="absolute top-6 left-6 px-4 py-2 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 text-xs font-black uppercase tracking-widest text-white">
                                        {product.category.name}
                                    </div>
                                )}
                            </div>

                            {/* Thumbnails */}
                            {product.images && product.images.length > 1 && (
                                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                                    {product.images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedImage(img)}
                                            className={`relative w-24 h-24 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all ${selectedImage === img
                                                ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                                                : 'border-white/5 hover:border-white/20 opacity-60 hover:opacity-100'
                                                }`}
                                        >
                                            <img
                                                src={getImageUrl(img)}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right: Info */}
                        <div className="flex flex-col">
                            <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight leading-tight">{product.name}</h1>

                            <div className="flex items-center gap-6 mb-8">
                                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                                    ${product.price.toFixed(2)}
                                </div>

                                {/* Stock Badge */}
                                <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${isOutOfStock
                                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                    : isLowStock
                                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                    }`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${isOutOfStock ? 'bg-rose-500' : isLowStock ? 'bg-amber-500' : 'bg-emerald-500'
                                        } animate-pulse`} />
                                    {isOutOfStock ? 'Out of Stock' : isLowStock ? `Low Stock: ${inventory} left` : 'In Stock'}
                                </div>
                            </div>

                            <p className="text-gray-400 text-lg leading-relaxed mb-10 border-l-2 border-white/10 pl-6">
                                {product.description}
                            </p>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-4 mb-12">
                                <Button
                                    onClick={() => product && addToCart(product)}
                                    disabled={isOutOfStock}
                                    className="h-16 px-12 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-[24px] font-black text-lg shadow-2xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-tight flex-1"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    {isOutOfStock ? 'Unavailable' : 'Add to Cart'}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={toggleWishlist}
                                    className={`h-16 w-16 border-white/10 hover:bg-white/10 rounded-[24px] flex items-center justify-center p-0 ${isWishlisted
                                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-500 hover:text-rose-500'
                                        : 'bg-white/5 text-gray-400 hover:text-white'
                                        }`}
                                >
                                    <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-rose-500' : ''}`} />
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { icon: Truck, title: "Express Delivery", desc: "Ships within 24 hours" },
                                    { icon: Shield, title: "Secure Payment", desc: "Encrypted transaction" },
                                    { icon: RefreshCw, title: "30-Day Returns", desc: "Hassle-free guarantee" },
                                    { icon: Layers, title: "Premium Quality", desc: "Certified authentic" }
                                ].map((feature, i) => (
                                    <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                        <feature.icon className="w-5 h-5 text-blue-500 mt-1" />
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-300">{feature.title}</h3>
                                            <p className="text-xs text-gray-500 mt-1">{feature.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
