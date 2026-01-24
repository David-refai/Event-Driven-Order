"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import ProductSkeleton from '@/components/ProductSkeleton';
import { apiClient, Product, Category } from '@/lib/api';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useServiceState } from '@/contexts/StatusContext';

function ProductsContent() {
    const searchParams = useSearchParams();
    const urlCategory = searchParams.get('category');
    const productServiceStatus = useServiceState('product-service');

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    useEffect(() => {
        const fetchData = async () => {
            if (productServiceStatus === 'OFFLINE') {
                setLoading(true);
                return;
            }
            try {
                const [productsData, categoriesData] = await Promise.all([
                    apiClient.getProducts(),
                    apiClient.getCategories()
                ]);
                setProducts(productsData);
                setCategories(categoriesData);

                // Handle URL category if present
                if (urlCategory && categoriesData.length > 0) {
                    const found = categoriesData.find(
                        c => c.name.toLowerCase() === urlCategory.toLowerCase()
                    );
                    if (found) {
                        setSelectedCategory(found.id.toString());
                    }
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [urlCategory, productServiceStatus]);

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || p.category?.id?.toString() === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const isProductServiceDown = productServiceStatus === 'OFFLINE';

    return (
        <main className="min-h-screen bg-gray-950 text-white font-outfit selection:bg-blue-500/30">
            <Navbar />

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 px-6 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/10 blur-[120px] rounded-full opacity-50" />

                <div className="max-w-7xl mx-auto relative">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight">
                            Elevate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Experience</span>
                        </h1>
                        <p className="text-gray-400 text-lg md:text-xl leading-relaxed">
                            Discover our curated collection of premium products and innovative solutions.
                            Crafted for excellence, designed for you.
                        </p>
                        {isProductServiceDown && (
                            <div className="mt-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                                <Search className="w-5 h-5 text-rose-500 animate-pulse" />
                                <span className="text-rose-400 font-bold text-sm">Product Service is currently undergoing maintenance (Offline).</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="sticky top-16 z-40 bg-gray-950/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 justify-between items-center">
                    {/* Search */}
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            disabled={isProductServiceDown}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-gray-600 disabled:opacity-50"
                        />
                    </div>

                    {/* Category Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            disabled={isProductServiceDown}
                            className={`px-4 md:px-6 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-bold transition-all whitespace-nowrap disabled:opacity-50 ${selectedCategory === 'all'
                                ? 'bg-white text-black shadow-lg shadow-white/10'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            All Products
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id?.toString() || '')}
                                disabled={isProductServiceDown}
                                className={`px-4 md:px-6 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-bold transition-all whitespace-nowrap disabled:opacity-50 ${selectedCategory === cat.id?.toString()
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* View Controls */}
                    <button className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                        <SlidersHorizontal className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-bold text-gray-300">Filters</span>
                    </button>
                </div>
            </div>

            {/* Products Grid */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                {loading || isProductServiceDown ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {[...Array(8)].map((_, i) => (
                            <ProductSkeleton key={i} />
                        ))}
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="py-32 text-center">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="w-8 h-8 text-gray-600" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">No products found</h2>
                        <p className="text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
                    </div>
                )}
            </div>

            <Footer />
        </main>
    );
}

export default function ProductsPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen bg-gray-950 text-white font-outfit">
                <Navbar />
                <div className="pt-32 px-6 max-w-7xl mx-auto">
                    <div className="h-20 w-1/2 bg-white/5 rounded-2xl animate-pulse mb-8" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-[500px] bg-white/5 rounded-[32px] animate-pulse" />
                        ))}
                    </div>
                </div>
                <Footer />
            </main>
        }>
            <ProductsContent />
        </Suspense>
    );
}
