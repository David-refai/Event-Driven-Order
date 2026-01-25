"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, User, LogIn, ChevronDown, Package, Zap, Globe, Shield, MessageCircle, Heart, Menu, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlistQuery } from '@/hooks/useWishlistQuery';

import { useServiceState } from '@/contexts/StatusContext';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { getImageUrl } from '@/lib/utils';

export default function Navbar() {
    const { user, logout, isLoading } = useAuth();
    const { openLogin } = useAuthModal();
    const { totalItems } = useCart();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isWishlistOpen, setIsWishlistOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    const gatewayStatus = useServiceState('api-gateway');
    const authStatus = useServiceState('auth-service');
    const productServiceStatus = useServiceState('product-service');

    const isAdmin = user?.roles.includes('ROLE_ADMIN');

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);

        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu on resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) setIsMobileMenuOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    interface NavItem {
        name: string;
        desc: string;
        icon: any;
        href: string;
    }

    const categories: { title: string; items: NavItem[] }[] = [
        {
            title: "Products",
            items: [
                { name: "Electronics", desc: "Latest gadgets and gear", icon: Zap, href: "/products?category=Electronics" },
                { name: "Fashion", desc: "Trendy apparel & accessories", icon: Package, href: "/products?category=Fashion" },
                { name: "Home & Garden", desc: "Stylish decor & furniture", icon: Globe, href: "/products?category=Home" },
                { name: "Health & Beauty", desc: "Skincare & wellness", icon: Shield, href: "/products?category=Health" }
            ]
        },
        {
            title: "Services",
            items: [
                { name: "Fast Delivery", desc: "Same day shipping", icon: Zap, href: "/services" },
                { name: "Global Support", desc: "24/7 dedicated help", icon: MessageCircle, href: "/services" },
                { name: "Secure Payments", desc: "Encrypted transactions", icon: Shield, href: "/services" },
                { name: "Warranty Plus", desc: "Extended coverage", icon: Package, href: "/services" }
            ]
        }
    ];

    const { wishlist } = useWishlistQuery();
    const wishlistCount = wishlist?.items?.length || 0;

    const isSystemHealthy = gatewayStatus === 'ONLINE' && authStatus === 'ONLINE';

    return (
        <>
            <nav className={`fixed top-0 left-0 w-full z-[60] transition-all duration-500
                ${isScrolled ? "bg-gray-950/80 backdrop-blur-xl border-b border-white/10 py-0" : "bg-transparent py-2"}`}
            >
                <div className="h-16 max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
                    {/* Left: Logo & Status */}
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2 group shrink-0">
                            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                                <Zap className="w-6 h-6 text-white fill-white" />
                            </div>
                            <span className="text-xl font-bold text-white tracking-tight font-outfit hidden sm:inline">EventFlow</span>
                        </Link>

                        <Link href="/admin/health" className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all shrink-0">
                            <div className={`w-2 h-2 rounded-full animate-pulse ${isSystemHealthy ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden lg:inline">
                                {isSystemHealthy ? 'Live' : 'Maintenance'}
                            </span>
                        </Link>
                    </div>

                    {/* Middle: Main Links (Desktop) */}
                    <div className="hidden lg:flex items-center gap-8 xl:gap-10">
                        <Link href="/" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Home</Link>
                        <Link href="/products" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Products</Link>

                        <div
                            className="group py-2 relative"
                            onMouseEnter={() => setIsMenuOpen(true)}
                            onMouseLeave={() => setIsMenuOpen(false)}
                        >
                            <button className="flex items-center gap-1.5 text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                                Explore
                                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <div className={`absolute top-full left-1/2 -translate-x-1/2 w-[500px] pt-4 transition-all duration-500 ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                                <div className="bg-gray-900/95 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        {categories[0].items.map((item) => (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all group/item"
                                            >
                                                <div className="p-3 bg-gray-800/50 rounded-xl group-hover/item:scale-110 transition-transform">
                                                    <item.icon className="w-5 h-5 text-blue-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white group-hover/item:text-blue-400 transition-colors uppercase tracking-tight">{item.name}</p>
                                                    <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Link href="/about" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">About</Link>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 md:gap-4 lg:gap-6">
                        {/* Wishlist (Desktop) */}
                        <div
                            className="relative hidden md:block"
                            onMouseEnter={() => setIsWishlistOpen(true)}
                            onMouseLeave={() => setIsWishlistOpen(false)}
                        >
                            <button className="relative p-2.5 text-gray-400 hover:text-rose-500 transition-colors rounded-xl hover:bg-white/5">
                                <Heart className="w-5 h-5" />
                                {wishlistCount > 0 && (
                                    <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center rounded-full border-2 border-gray-950">
                                        {wishlistCount}
                                    </span>
                                )}
                            </button>

                            <div className={`absolute top-full right-0 w-80 pt-4 transition-all duration-300 ${isWishlistOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                                <div className="bg-gray-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-4">
                                    <h3 className="font-bold text-white mb-4 px-2">Wishlist Preview</h3>
                                    <div className="max-h-64 overflow-y-auto space-y-2 custom-scrollbar pr-1">
                                        {wishlist?.items?.length ? wishlist.items.map((item) => (
                                            <Link key={item.productId} href={`/products/${item.productId}`} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors group">
                                                <div className="w-12 h-12 rounded-lg bg-gray-800 overflow-hidden flex-shrink-0">
                                                    {item.productImage && <img src={getImageUrl(item.productImage)} alt="" className="w-full h-full object-cover" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-white truncate group-hover:text-rose-400">{item.productName}</p>
                                                    <p className="text-[10px] text-gray-500">${item.price}</p>
                                                </div>
                                            </Link>
                                        )) : (
                                            <p className="py-4 text-center text-xs text-gray-500">Your wishlist is empty</p>
                                        )}
                                    </div>
                                    <Link href="/wishlist" className="block w-full mt-4 py-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl text-[10px] font-black text-center uppercase tracking-widest transition-all">
                                        View Full Wishlist
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Cart */}
                        <Link href="/cart" className="relative p-2.5 text-gray-400 hover:text-blue-400 transition-colors rounded-xl hover:bg-white/5">
                            <ShoppingCart className="w-5 h-5" />
                            {totalItems > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-blue-600 text-[10px] font-bold text-white flex items-center justify-center rounded-full border-2 border-gray-950">
                                    {totalItems}
                                </span>
                            )}
                        </Link>

                        {/* User Profile (Desktop) */}
                        <div className="hidden lg:block min-w-[120px]">
                            {isLoading ? (
                                <div className="h-10 w-10 rounded-full bg-white/5 animate-pulse ml-auto" />
                            ) : user ? (
                                <div
                                    className="relative"
                                    onMouseEnter={() => setIsUserMenuOpen(true)}
                                    onMouseLeave={() => setIsUserMenuOpen(false)}
                                >
                                    <div className="flex items-center gap-3 cursor-pointer group pl-4 border-l border-white/10">
                                        {user.profilePicture ? (
                                            <img
                                                src={getImageUrl(user.profilePicture)}
                                                alt={user.username}
                                                className="w-10 h-10 rounded-full border-2 border-white/10 group-hover:scale-105 transition-transform shadow-lg object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center border-2 border-white/10 group-hover:scale-105 transition-transform shadow-lg shadow-indigo-500/20">
                                                <User className="w-5 h-5 text-white" />
                                            </div>
                                        )}
                                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                                    </div>

                                    <div className={`absolute top-full right-0 w-64 pt-4 transition-all duration-300 ${isUserMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                                        <div className="bg-gray-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-2 font-outfit">
                                            <div className="p-4 border-b border-white/5 mb-2">
                                                <p className="text-sm font-bold text-white truncate">{user.username}</p>
                                                <p className="text-[11px] text-gray-500 truncate lowercase">{user.email}</p>
                                            </div>
                                            <Link href="/wishlist" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-sm text-gray-300 hover:text-white transition-all">
                                                <Heart className="w-4 h-4 text-rose-400" />
                                                <span>My Wishlist</span>
                                            </Link>
                                            <Link href="/profile" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-sm text-gray-300 hover:text-white transition-all">
                                                <User className="w-4 h-4 text-blue-400" />
                                                <span>Profile</span>
                                            </Link>
                                            <Link href="/settings" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-sm text-gray-300 hover:text-white transition-all">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
                                                <span>Settings</span>
                                            </Link>
                                            {isAdmin && (
                                                <Link href="/admin/dashboard" className="flex items-center gap-3 p-3 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-sm text-blue-400 transition-all border border-blue-600/20 my-1">
                                                    <Shield className="w-4 h-4" />
                                                    <span className="font-bold">Admin Panel</span>
                                                </Link>
                                            )}
                                            <button onClick={logout} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-rose-500/10 text-sm text-gray-400 hover:text-rose-400 transition-all mt-1">
                                                <LogIn className="w-4 h-4" />
                                                <span className="font-bold">Sign Out</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={openLogin}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-white text-black text-xs font-black rounded-full hover:bg-blue-50 transition-all uppercase tracking-widest active:scale-95"
                                >
                                    Login
                                </button>
                            )}
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2.5 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Drawer */}
            <div className={`fixed inset-0 z-[55] lg:hidden transition-all duration-500 ${isMobileMenuOpen ? 'visible' : 'invisible'}`}>
                {/* Backdrop */}
                <div
                    className={`absolute inset-0 bg-gray-950/60 backdrop-blur-md transition-opacity duration-500 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                />

                {/* Content */}
                <div className={`absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-gray-900 border-l border-white/10 shadow-2xl transition-transform duration-500 ease-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="h-full flex flex-col pt-24 pb-8 px-6 overflow-y-auto">
                        {user ? (
                            <div className="mb-8 p-6 bg-white/5 rounded-[32px] border border-white/5">
                                <div className="flex items-center gap-4 mb-4">
                                    {user.profilePicture ? (
                                        <img
                                            src={getImageUrl(user.profilePicture)}
                                            alt={user.username}
                                            className="w-12 h-12 rounded-2xl border-2 border-white/10 shadow-lg object-cover"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <p className="text-lg font-bold text-white truncate">{user.username}</p>
                                        <p className="text-xs text-gray-500 truncate lowercase">{user.email}</p>
                                    </div>
                                </div>
                                {isAdmin && (
                                    <Link
                                        href="/admin/dashboard"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white text-sm font-bold rounded-2xl mb-3 shadow-[0_8px_20px_rgba(37,99,235,0.3)]"
                                    >
                                        <Shield className="w-4 h-4" />
                                        Admin Dashboard
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    openLogin();
                                }}
                                className="mb-8 flex items-center justify-center gap-2 w-full py-4 bg-white text-black text-sm font-bold rounded-2xl transition-transform active:scale-95"
                            >
                                <LogIn className="w-4 h-4" />
                                Sign In / Register
                            </button>
                        )}

                        {/* Navigation Links (Mobile) */}
                        <div className="space-y-4">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">Main Menu</p>
                            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10 transition-colors">
                                <Zap className="w-5 h-5 text-blue-400" />
                                Home
                            </Link>
                            <Link href="/products" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10 transition-colors">
                                <Package className="w-5 h-5 text-cyan-400" />
                                Products
                            </Link>
                            <Link href="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10 transition-colors">
                                <Heart className="w-5 h-5 text-rose-400" />
                                Wishlist
                                {wishlistCount > 0 && <span className="ml-auto bg-rose-500 text-[10px] px-2 py-0.5 rounded-full">{wishlistCount}</span>}
                            </Link>
                        </div>

                        {/* Modules (Mobile) */}
                        <div className="mt-8 space-y-4">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">Explore Modules</p>
                            <div className="grid grid-cols-2 gap-3">
                                {categories[0].items.map(item => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors text-center"
                                    >
                                        <item.icon className="w-5 h-5 text-gray-400 mb-2" />
                                        <span className="text-[10px] font-bold text-white uppercase">{item.name}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Footer (Mobile) */}
                        <div className="mt-auto pt-8 border-t border-white/5 flex items-center justify-between">
                            {user && (
                                <button onClick={logout} className="flex items-center gap-2 text-rose-400 text-sm font-bold">
                                    <LogIn className="w-4 h-4" />
                                    Logout
                                </button>
                            )}
                            <p className="text-[10px] text-gray-600 font-mono">v1.0.4-stable</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
