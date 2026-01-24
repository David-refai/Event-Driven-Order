"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, User, LogIn, ChevronDown, Package, Zap, Globe, Shield, MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
    const { user, logout, isLoading } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);

        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const categories = [
        {
            title: "Products",
            items: [
                { name: "Electronics", desc: "Latest gadgets and gear", icon: Zap },
                { name: "Fashion", desc: "Trendy apparel & accessories", icon: Package },
                { name: "Home & Garden", desc: "Stylish decor & furniture", icon: Globe },
                { name: "Health & Beauty", desc: "Skincare & wellness", icon: Shield }
            ]
        },
        {
            title: "Services",
            items: [
                { name: "Fast Delivery", desc: "Same day shipping", icon: Zap },
                { name: "Global Support", desc: "24/7 dedicated help", icon: MessageCircle },
                { name: "Secure Payments", desc: "Encrypted transactions", icon: Shield },
                { name: "Warranty Plus", desc: "Extended coverage", icon: Package }
            ]
        }
    ];

    return (
        <nav className={`fixed top-0 left-0 w-full z-50 transition-colors duration-500
            ${isScrolled ? "bg-gray-950/80 backdrop-blur-xl border-b border-white/10" : "bg-transparent"}`}
        >
            <div className="h-16 max-w-7xl mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                        <Zap className="w-6 h-6 text-white fill-white" />
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight font-outfit">EventFlow</span>
                </Link>

                {/* Main Links */}
                <div className="hidden lg:flex items-center gap-10">
                    <Link href="/" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Home</Link>
                    <Link href="/products" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">All Products</Link>

                    {/* Products Mega Menu Trigger */}
                    <div
                        className="group py-2"
                        onMouseEnter={() => setIsMenuOpen(true)}
                        onMouseLeave={() => setIsMenuOpen(false)}
                    >
                        <button className="flex items-center gap-1.5 text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                            Products
                            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Mega Menu Content */}
                        <div className={`absolute top-full left-0 w-full pt-4 transition-all duration-500 ${isMenuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
                            }`}>
                            <div className="max-w-7xl mx-auto px-6">
                                <div className="bg-gray-900/95 backdrop-blur-2xl border border-white/10 rounded-[32px] overflow-hidden shadow-2xl p-8 grid grid-cols-2 gap-12">
                                    {categories.map((cat) => (
                                        <div key={cat.title}>
                                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-6">{cat.title}</h3>
                                            <div className="grid grid-cols-2 gap-6">
                                                {cat.items.map((item) => (
                                                    <Link
                                                        key={item.name}
                                                        href={`/products?category=${encodeURIComponent(item.name)}`}
                                                        className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all group/item"
                                                    >
                                                        <div className="p-3 bg-gray-800/50 rounded-xl group-hover/item:scale-110 transition-transform">
                                                            <item.icon className="w-5 h-5 text-blue-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-white group-hover/item:text-blue-400 transition-colors">{item.name}</p>
                                                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <Link href="/about" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">About</Link>
                    <Link href="/contact" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Contact</Link>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-6 min-w-[120px] justify-end">
                    <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                        <ShoppingCart className="w-5 h-5" />
                        <span className="absolute top-0 right-0 w-4 h-4 bg-blue-600 text-[10px] font-bold text-white flex items-center justify-center rounded-full border-2 border-gray-950">
                            0
                        </span>
                    </button>

                    <div className="min-w-[220px] flex justify-end">
                        {isLoading ? (
                            <div className="h-10 w-40 rounded-full bg-white/10 animate-pulse" />
                        ) : user ? (
                            <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center border-2 border-white/10 cursor-pointer hover:scale-105 transition-transform">
                                    <User className="w-5 h-5 text-white" />
                                </div>
                                <button
                                    onClick={logout}
                                    className="text-xs font-bold text-gray-500 hover:text-rose-400 transition-colors uppercase tracking-widest"
                                >
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="flex items-center gap-2 px-6 py-2.5 bg-white text-black text-sm font-bold rounded-full hover:bg-gray-200 transition-all active:scale-95"
                            >
                                <LogIn className="w-4 h-4" />
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
