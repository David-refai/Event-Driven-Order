"use client";

import React from 'react';

export default function ProductSkeleton() {
    return (
        <div className="relative bg-gray-900/40 backdrop-blur-md border border-white/5 rounded-[32px] overflow-hidden">
            {/* Image Placeholder */}
            <div className="relative aspect-[4/5] bg-white/5 overflow-hidden">
                <div className="absolute inset-0 animate-shimmer" />
            </div>

            {/* Content Section */}
            <div className="p-6 space-y-4">
                <div className="flex justify-between items-start gap-4">
                    {/* Title Placeholder */}
                    <div className="h-6 bg-white/10 rounded-lg flex-1 overflow-hidden relative">
                        <div className="absolute inset-0 animate-shimmer" />
                    </div>
                    {/* Price Placeholder */}
                    <div className="h-6 w-16 bg-white/10 rounded-lg overflow-hidden relative">
                        <div className="absolute inset-0 animate-shimmer" />
                    </div>
                </div>

                {/* Description Placeholder */}
                <div className="space-y-2">
                    <div className="h-4 bg-white/5 rounded-lg w-full overflow-hidden relative">
                        <div className="absolute inset-0 animate-shimmer" />
                    </div>
                    <div className="h-4 bg-white/5 rounded-lg w-4/5 overflow-hidden relative">
                        <div className="absolute inset-0 animate-shimmer" />
                    </div>
                </div>

                {/* Button Placeholder */}
                <div className="flex items-center gap-3 mt-6">
                    <div className="h-12 flex-1 bg-white/10 rounded-2xl overflow-hidden relative">
                        <div className="absolute inset-0 animate-shimmer" />
                    </div>
                    <div className="h-12 w-12 bg-white/10 rounded-2xl overflow-hidden relative">
                        <div className="absolute inset-0 animate-shimmer" />
                    </div>
                </div>
            </div>
        </div>
    );
}
