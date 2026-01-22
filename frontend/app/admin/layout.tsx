"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/admin/Sidebar';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        } else if (!isLoading && user && !user.roles.includes('ROLE_ADMIN')) {
            // Redirect non-admins to main page or show unauthorized
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
        return null; // Or a restricted access component
    }

    return (
        <div className="flex h-[calc(100vh-theme(spacing.24))] bg-gray-950 text-gray-100">
            <div className="fixed top-24 bottom-0 left-0 w-64 border-r border-white/5">
                <Sidebar />
            </div>
            <main className="flex-1 ml-64 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
