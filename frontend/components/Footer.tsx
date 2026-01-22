"use client";

import React from 'react';
import Link from 'next/link';
import { Github, Twitter, Linkedin, Instagram, Mail, Zap, Phone, MapPin } from 'lucide-react';

export default function Footer() {
    const sections = [
        {
            title: "Platform",
            links: ["Features", "Security", "Analytics", "Inventory", "Payments"]
        },
        {
            title: "Company",
            links: ["About Us", "Our Team", "Careers", "Contact", "Partners"]
        },
        {
            title: "Resources",
            links: ["Documentation", "API Reference", "Status", "Open Source", "Support"]
        }
    ];

    const socials = [
        { icon: Twitter, href: "#", color: "hover:text-sky-400" },
        { icon: Github, href: "#", color: "hover:text-white" },
        { icon: Linkedin, href: "#", color: "hover:text-blue-600" },
        { icon: Instagram, href: "#", color: "hover:text-pink-500" }
    ];

    return (
        <footer className="relative bg-gray-950 pt-24 pb-12 overflow-hidden border-t border-white/5">
            {/* Background Glow */}
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] -z-10" />
            <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-purple-600/5 blur-[100px] -z-10" />

            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
                    {/* Brand Section */}
                    <div className="lg:col-span-4">
                        <Link href="/" className="flex items-center gap-2 mb-8">
                            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-xl flex items-center justify-center">
                                <Zap className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-white tracking-tight">EventFlow</span>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-sm">
                            Next-generation event-driven architecture for real-time order processing and analytics at scale. Built for the modern web with premium aesthetics.
                        </p>
                        <div className="flex gap-5">
                            {socials.map((social, i) => (
                                <a
                                    key={i}
                                    href={social.href}
                                    className={`p-3 bg-white/5 rounded-xl text-gray-400 transition-all ${social.color} hover:-translate-y-1`}
                                >
                                    <social.icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Sections */}
                    <div className="lg:col-span-6 grid grid-cols-2 md:grid-cols-3 gap-12">
                        {sections.map((section) => (
                            <div key={section.title}>
                                <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-6">{section.title}</h4>
                                <ul className="space-y-4">
                                    {section.links.map((link) => (
                                        <li key={link}>
                                            <Link href="#" className="text-sm text-gray-500 hover:text-white transition-colors">{link}</Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Contact Info */}
                    <div className="lg:col-span-2">
                        <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-6">Connect</h4>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3 text-sm text-gray-500">
                                <Mail className="w-4 h-4" />
                                hello@eventflow.io
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-500">
                                <Phone className="w-4 h-4" />
                                +1 (555) 000-0000
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-500">
                                <MapPin className="w-4 h-4" />
                                Silicon Valley, CA
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-xs text-gray-600">
                        &copy; {new Date().getFullYear()} EventFlow Inc. All rights reserved.
                    </p>
                    <div className="flex gap-8">
                        <Link href="#" className="text-xs text-gray-600 hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="#" className="text-xs text-gray-600 hover:text-white transition-colors">Terms of Service</Link>
                        <Link href="#" className="text-xs text-gray-600 hover:text-white transition-colors">Cookie Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
