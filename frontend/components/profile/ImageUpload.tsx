'use client';

import React, { useRef, useState } from 'react';
import { Camera, Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { getImageUrl } from '@/lib/utils';

interface ImageUploadProps {
    currentImage?: string;
    username: string;
}

export function ImageUpload({ currentImage, username }: ImageUploadProps) {
    const { uploadProfilePicture } = useAuth();
    const [preview, setPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        const file = fileInputRef.current?.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            await uploadProfilePicture(file);
            toast.success('Profile picture updated successfully!');
            setPreview(null);
        } catch (error: any) {
            toast.error(error.message || 'Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleCancel = () => {
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="relative inline-block">
            <div className="relative w-32 h-32">
                {preview ? (
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-32 h-32 rounded-full border-4 border-blue-500 object-cover shadow-2xl animate-in fade-in zoom-in duration-300"
                    />
                ) : currentImage ? (
                    <img
                        src={getImageUrl(currentImage)}
                        alt={username}
                        className="w-32 h-32 rounded-full border-4 border-gray-900 object-cover shadow-2xl"
                    />
                ) : (
                    <div className="w-32 h-32 rounded-full border-4 border-gray-900 bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-2xl">
                        <span className="text-4xl font-bold text-white">{username.charAt(0).toUpperCase()}</span>
                    </div>
                )}

                {/* Overlays */}
                {uploading && (
                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                )}

                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute bottom-1 right-1 w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 rounded-full flex items-center justify-center transition-all shadow-lg hover:scale-110 active:scale-95"
                >
                    <Camera className="w-5 h-5 text-white" />
                </button>
            </div>

            {/* Selection Controls */}
            {preview && !uploading && (
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex gap-2 animate-in slide-in-from-top-4 duration-300">
                    <button
                        onClick={handleUpload}
                        className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-lg"
                        title="Upload"
                    >
                        <Upload className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleCancel}
                        className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg shadow-lg"
                        title="Cancel"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />
        </div>
    );
}
