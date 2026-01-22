"use client";

import React from 'react';
import { ArrowRight, MousePointer2, Sparkles, Zap, Shield, BarChart3, Globe } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-center overflow-hidden bg-gray-950">
      {/* Animated Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] animate-pulse rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] animate-pulse delay-700 rounded-full" />
      </div>

      {/* Hero Content */}
      <div className="max-w-5xl mx-auto px-6 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-blue-400 text-sm font-medium mb-12 hover:bg-white/10 transition-colors cursor-default">
          <Sparkles className="w-4 h-4" />
          <span>The Evolution of Event-Driven Commerce</span>
        </div>

        <h1 className="text-7xl md:text-9xl font-bold text-white tracking-tighter mb-10 font-outfit leading-[0.9]">
          Scale Beyond <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400">Boundaries</span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-400 leading-relaxed mb-16 max-w-3xl mx-auto font-light">
          Experience the power of a fully distributed architecture. Real-time order processing, intelligent analytics, and global inventory management at your fingertips.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
          <Link
            href="/login"
            className="group flex items-center gap-3 px-10 py-5 bg-white text-black font-bold rounded-2xl hover:bg-blue-50 transition-all active:scale-95 shadow-2xl shadow-white/5"
          >
            Launch Dashboard
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/about"
            className="flex items-center gap-3 px-10 py-5 bg-white/5 text-white font-bold rounded-2xl border border-white/10 hover:bg-white/10 transition-all backdrop-blur-md"
          >
            <MousePointer2 className="w-5 h-5 text-gray-400" />
            Explore Modules
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-4 gap-12 border-t border-white/5 pt-16">
          {[
            { label: "Kafka Events", val: "Real-time", icon: Zap, color: "text-amber-400" },
            { label: "System Health", val: "99.99%", icon: Shield, color: "text-emerald-400" },
            { label: "Predictive Analytics", val: "Live", icon: BarChart3, color: "text-blue-400" },
            { label: "Global Reach", val: "Distributed", icon: Globe, color: "text-purple-400" }
          ].map((feature) => (
            <div key={feature.label} className="flex flex-col items-center group">
              <div className={`p-4 bg-white/5 rounded-2xl mb-4 group-hover:scale-110 transition-transform ${feature.color}`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <p className="text-2xl font-bold text-white mb-1">{feature.val}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">{feature.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
