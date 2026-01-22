"use client";

import React from 'react';

interface AdminAvatarProps {
    name: string;
    size?: number;
}

export const AdminAvatar: React.FC<AdminAvatarProps> = ({ name, size = 48 }) => {
    // Use DiceBear API for a premium looking avatar
    // Style 'micah' or 'notionists' offers a modern, artistic look
    const avatarUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name)}&backgroundColor=e5e7eb`;

    return (
        <div
            className="relative rounded-full overflow-hidden border-2 border-white shadow-lg transition-transform hover:scale-105 duration-200"
            style={{ width: size, height: size }}
        >
            <img
                src={avatarUrl}
                alt={`${name}'s avatar`}
                className="w-full h-full object-cover"
            />
        </div>
    );
};
