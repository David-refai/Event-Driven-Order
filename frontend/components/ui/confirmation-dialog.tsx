"use client";

import React from 'react';
import { Modal } from './modal';
import { Button } from './button';
import { AlertCircle } from 'lucide-react';

interface ConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'primary';
}

export function ConfirmationDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'danger'
}: ConfirmationDialogProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
            <div className="flex flex-col items-center text-center">
                <div className={`w-16 h-16 ${variant === 'danger' ? 'bg-rose-500/10 text-rose-500' : 'bg-blue-500/10 text-blue-500'} rounded-2xl flex items-center justify-center mb-6`}>
                    <AlertCircle className="w-8 h-8" />
                </div>
                <p className="text-gray-400 mb-8 leading-relaxed">
                    {description}
                </p>
                <div className="flex gap-4 w-full">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="flex-1 h-12 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all"
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 h-12 ${variant === 'danger' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-xl font-bold shadow-xl ${variant === 'danger' ? 'shadow-rose-500/20' : 'shadow-blue-500/20'} transition-all`}
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
