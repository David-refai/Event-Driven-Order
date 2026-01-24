"use client";

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { StatusProvider } from '@/contexts/StatusContext';

import { AuthModalProvider } from '@/contexts/AuthModalContext';

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000, // 1 minute
                refetchOnWindowFocus: false,
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <AuthModalProvider>
                    <CartProvider>
                        <StatusProvider>
                            {children}
                        </StatusProvider>
                    </CartProvider>
                </AuthModalProvider>
            </AuthProvider>
        </QueryClientProvider>
    );
}
