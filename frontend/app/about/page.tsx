"use client";

import React from 'react';
import {
    Code2,
    Cpu,
    Globe2,
    Layers,
    Rocket,
    ShieldCheck,
    Sparkles,
    Zap,
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
    return (
        <div className="relative min-h-[90vh] flex flex-col items-center pt-24 pb-20 overflow-hidden bg-gray-950 px-6">
            {/* Animated Background Gradients - Consistent with Home */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
                <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-blue-600/15 blur-[120px] animate-pulse rounded-full" />
                <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] animate-pulse delay-1000 rounded-full" />
            </div>

            {/* Hero Section */}
            <div className="max-w-4xl mx-auto text-center mb-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
                    <Sparkles className="w-4 h-4" />
                    <span>Advanced Engineering</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-8 font-outfit">
                    We Build The <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">Future of Commerce</span>
                </h1>

                <p className="text-xl text-gray-400 leading-relaxed font-light max-w-2xl mx-auto">
                    Our company specializes in high-performance, event-driven systems. We leverage modern programming paradigms to build scalable, resilient, and distributed architectures.
                </p>
            </div>

            {/* Main Card - Company Focus */}
            <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-24 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
                <div className="group relative p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-blue-500/30 transition-all overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Code2 className="w-32 h-32 text-blue-400" />
                    </div>

                    <div className="relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 text-blue-400">
                            <Cpu className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4">Programming Excellence</h3>
                        <p className="text-gray-400 leading-relaxed mb-6">
                            We operate exclusively on modern programming systems. From Spring Boot microservices to Apache Kafka event pipelines, our codebase is built for extreme reliability and speed.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            {['Java 21', 'Spring Boot 3', 'Kafka', 'PostgreSQL', 'Next.js'].map(tech => (
                                <span key={tech} className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-xs font-mono text-blue-300">
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="group relative p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-indigo-500/30 transition-all overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Globe2 className="w-32 h-32 text-indigo-400" />
                    </div>

                    <div className="relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-6 text-indigo-400">
                            <Layers className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4">Event-Driven Culture</h3>
                        <p className="text-gray-400 leading-relaxed mb-6">
                            In a world that never sleeps, consistency is key. Our systems process millions of events in real-time, ensuring data integrity across every node of your global distribution network.
                        </p>
                        <div className="flex items-center gap-2 text-indigo-400 font-bold group-hover:gap-4 transition-all cursor-pointer">
                            View Our Architecture <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Row */}
            <div className="max-w-5xl w-full grid grid-cols-2 md:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-500">
                {[
                    { title: "Scalable", icon: Rocket, label: "Cloud Native" },
                    { title: "Secure", icon: ShieldCheck, label: "End-to-End" },
                    { title: "Real-time", icon: Zap, label: "Low Latency" },
                    { title: "Global", icon: Globe2, label: "Edge Priority" },
                ].map((item, idx) => (
                    <div key={idx} className="p-6 rounded-2xl bg-white/5 border border-white/5 text-center group hover:bg-white/10 transition-colors">
                        <item.icon className="w-6 h-6 text-gray-400 mb-3 mx-auto group-hover:scale-110 transition-transform" />
                        <p className="text-white font-bold mb-1">{item.title}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">{item.label}</p>
                    </div>
                ))}
            </div>

            <div className="mt-24">
                <Link
                    href="/"
                    className="text-gray-500 hover:text-white transition-colors text-sm flex items-center gap-2"
                >
                    Back to Home
                </Link>
            </div>
        </div>
    );
}
