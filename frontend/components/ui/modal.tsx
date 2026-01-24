"use client";

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }: ModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6 animate-in fade-in duration-300">
            <div
                className="absolute inset-0 bg-gray-950/80 backdrop-blur-md"
                onClick={onClose}
            />
            <div className={`relative w-full ${maxWidth} bg-gray-900 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300`}>
                <div className="p-8 border-b border-white/5 flex flex-row items-center justify-between bg-gray-900/50 backdrop-blur">
                    <h2 className="text-2xl font-black text-white font-outfit">{title}</h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="rounded-full hover:bg-white/5 h-10 w-10"
                    >
                        <X className="w-6 h-6 text-gray-500" />
                    </Button>
                </div>
                <div className="p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );
}
