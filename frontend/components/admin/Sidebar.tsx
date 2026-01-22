"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AdminAvatar } from './AdminAvatar';
import { useAuth } from '@/contexts/AuthContext';

export const Sidebar = () => {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const navItems = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
        { name: 'Users', href: '/admin/users', icon: '👥' },
        { name: 'Orders', href: '/admin/orders', icon: '📦' },
    ];

    return (
        <div className="w-64 h-full bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col shadow-xl border-r border-white/5">
            {/* User Profile Section */}
            <div className="p-6 flex flex-col items-center bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
                <div className="mb-4">
                    <AdminAvatar name={user?.username || 'Admin'} size={80} />
                </div>
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                    {user?.username || 'Administrator'}
                </h2>
                <span className="text-xs text-gray-400 uppercase tracking-wider mt-1">
                    {user?.roles?.includes('ROLE_ADMIN') ? 'Super Admin' : 'Admin'}
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${isActive
                                ? 'bg-blue-600/20 text-blue-300 shadow-inner'
                                : 'text-gray-300 hover:bg-gray-800 hover:text-white hover:translate-x-1'
                                }`}
                        >
                            <span className="mr-3 text-xl group-hover:scale-110 transition-transform duration-200">{item.icon}</span>
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-gray-700 bg-gray-900/50">
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-300 bg-red-900/20 rounded-lg hover:bg-red-900/40 transition-colors duration-200"
                >
                    <span className="mr-2">🚪</span>
                    Logout
                </button>
            </div>
        </div>
    );
};
