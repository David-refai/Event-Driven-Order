'use client';

import { Toaster } from 'sonner';

export function ToastProvider() {
    return (
        <Toaster
            position="top-right"
            expand={false}
            richColors
            closeButton
            duration={4000}
            toastOptions={{
                style: {
                    background: 'rgba(17, 24, 39, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    backdropFilter: 'blur(12px)',
                },
                className: 'font-outfit',
            }}
        />
    );
}
