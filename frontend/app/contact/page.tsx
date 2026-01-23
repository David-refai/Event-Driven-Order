"use client";

import React, { useState } from 'react';
import {
    Mail,
    Phone,
    MapPin,
    Send,
    Globe2,
    MessageSquare,
    Clock,
    ShieldCheck,
    Sparkles,
    ArrowRight
} from 'lucide-react';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Sending message:', formData);
        // Add animation or feedback here
    };

    return (
        <div className="relative min-h-[90vh] flex flex-col items-center pt-24 pb-20 overflow-hidden bg-gray-950 px-6">
            {/* Background elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-600/5 blur-[150px] animate-pulse rounded-full" />
            </div>

            {/* Header */}
            <div className="max-w-4xl mx-auto text-center mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
                    <Globe2 className="w-4 h-4" />
                    <span>Global Presence</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-8 font-outfit leading-[1.1]">
                    Let's Start a <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400">Connection</span>
                </h1>

                <p className="text-xl text-gray-400 leading-relaxed font-light max-w-2xl mx-auto">
                    Whether you're looking for global distribution or a technical partnership, our team of engineers is ready to help you scale.
                </p>
            </div>

            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
                {/* Left Column: Contact Info */}
                <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-12 duration-1000">
                    <div className="p-8 rounded-[32px] bg-white/[0.03] border border-white/10 backdrop-blur-md shadow-2xl relative overflow-hidden group">
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 blur-3xl group-hover:bg-blue-500/20 transition-all rounded-full" />

                        <h3 className="text-2xl font-bold text-white mb-8">Contact Information</h3>

                        <div className="space-y-6">
                            {[
                                { icon: Mail, label: "Email Us", val: "solutions@eventflow.com", color: "text-blue-400" },
                                { icon: Phone, label: "Call Us", val: "+1 (555) 000-8888", color: "text-emerald-400" },
                                { icon: MapPin, label: "Headquarters", val: "Tech Hub, Silicon Valley, CA", color: "text-purple-400" },
                                { icon: Clock, label: "Response Time", val: "Within 12 business hours", color: "text-amber-400" }
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-5 group/item">
                                    <div className={`p-4 bg-white/5 rounded-2xl ${item.color} group-hover/item:scale-110 transition-transform`}>
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">{item.label}</p>
                                        <p className="text-white font-medium">{item.val}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-8 rounded-[32px] bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-white/10 backdrop-blur-xl">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white/10 rounded-xl text-blue-300">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-white mb-2">Secure Channels</h4>
                                <p className="text-sm text-blue-200/60 leading-relaxed">
                                    All communications are encrypted and handled through our secure distributed infrastructure. Your data privacy is our engineering priority.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Form */}
                <div className="lg:col-span-7 animate-in fade-in slide-in-from-right-12 duration-1000">
                    <div className="p-10 rounded-[32px] bg-white/[0.02] border border-white/10 backdrop-blur-sm relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-10">
                            <MessageSquare className="w-6 h-6 text-blue-400" />
                            <h3 className="text-2xl font-bold text-white">Send a Message</h3>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-outfit"
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Work Email</label>
                                    <input
                                        type="email"
                                        placeholder="john@company.com"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-outfit"
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Subject</label>
                                <input
                                    type="text"
                                    placeholder="System Architecture Inquiry"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-outfit"
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Message</label>
                                <textarea
                                    rows={5}
                                    placeholder="Tell us about your project requirements..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all resize-none font-outfit"
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full group flex items-center justify-center gap-3 py-5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all active:scale-[0.98] shadow-xl shadow-blue-500/20 overflow-hidden"
                            >
                                <span>Initialize Connection</span>
                                <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Global Locations Grid */}
            <div className="max-w-6xl w-full animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-500">
                <div className="flex items-center gap-4 mb-10">
                    <div className="h-[1px] flex-1 bg-white/10" />
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em]">Our Global Hubs</h4>
                    <div className="h-[1px] flex-1 bg-white/10" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { city: "San Francisco", region: "Americas", status: "Active" },
                        { city: "London", region: "Europe", status: "Active" },
                        { city: "Tokyo", region: "Asia Pacific", status: "Active" },
                        { city: "Dubai", region: "Middle East", status: "Standby" }
                    ].map((loc, idx) => (
                        <div key={idx} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-all text-center">
                            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse mb-3" />
                            <p className="text-white font-bold">{loc.city}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">{loc.region}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
