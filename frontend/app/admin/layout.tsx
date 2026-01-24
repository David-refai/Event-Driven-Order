"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/admin/Sidebar';
import { Menu, X, ChevronRight } from 'lucide-react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading, isAuthenticated } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        } else if (!isLoading && user && !user.roles.includes('ROLE_ADMIN')) {
            router.push('/');
        }
    }, [isLoading, isAuthenticated, user, router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!user || !user.roles.includes('ROLE_ADMIN')) {
        return null;
    }

    return (
        <div className="flex h-full bg-gray-950 text-gray-100 min-h-[calc(100vh-6rem)] relative">
            {/* Sidebar Desktop */}
            <aside className="hidden lg:block w-64 border-r border-white/5 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto shrink-0">
                <Sidebar />
            </aside>

            {/* Sidebar Mobile Drawer */}
            <div className={`fixed inset-0 z-[100] lg:hidden transition-all duration-500 ${isSidebarOpen ? 'visible' : 'invisible'}`}>
                <div className={`absolute inset-0 bg-gray-950/60 backdrop-blur-md transition-opacity duration-500 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsSidebarOpen(false)} />
                <aside className={`absolute left-0 top-0 bottom-0 w-64 bg-gray-900 border-r border-white/10 transition-transform duration-500 ease-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="h-full flex flex-col p-4 pt-20">
                        <Sidebar />
                    </div>
                </aside>
            </div>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
                {/* Mobile Header/Toggle */}
                <div className="lg:hidden sticky top-20 z-40 px-4 py-3 bg-gray-900/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between mb-4">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-600/20 flex items-center gap-2 text-xs font-black uppercase tracking-widest"
                    >
                        <Menu className="w-4 h-4" />
                        Admin Menu
                    </button>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                        Dashboard <ChevronRight className="w-3 h-3" />
                    </div>
                </div>

                <div className="p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
