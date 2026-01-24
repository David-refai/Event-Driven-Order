"use client";

import React, { useState, useEffect } from 'react';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap, ShieldCheck, ArrowRight, Loader2, X, Mail, User, Lock, Info } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AuthModal() {
    const { isOpen, mode, closeModal, setMode } = useAuthModal();
    const { login, register, isAuthenticated } = useAuth();
    const router = useRouter();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated && isOpen) {
            closeModal();
        }
    }, [isAuthenticated, isOpen, closeModal]);

    // Reset state when modal opens/closes or mode changes
    useEffect(() => {
        setError('');
        setSuccess('');
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
    }, [isOpen, mode]);

    if (!isOpen) return null;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(username, password);
            closeModal();
            router.refresh();
        } catch (err) {
            setError('Invalid credentials. Please check your username and password.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (username.length < 3) {
            setError('Username must be at least 3 characters long');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            await register(username, email, password);
            setSuccess('Account created! Please check your email to verify.');
            setTimeout(() => setMode('login'), 3000);
        } catch (err: any) {
            setError(err.message || 'Registration failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-950/60 backdrop-blur-md animate-in fade-in duration-300"
                onClick={closeModal}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-[480px] bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
                {/* Close Button */}
                <button
                    onClick={closeModal}
                    className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all transform hover:rotate-90"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8 md:p-10">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl shadow-2xl shadow-blue-500/20 mb-6">
                            <Zap className="w-8 h-8 text-white fill-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-white tracking-tight mb-2 font-outfit">
                            {mode === 'login' ? 'Welcome Back' : 'Join EventFlow'}
                        </h2>
                        <p className="text-gray-400 text-sm">
                            {mode === 'login' ? 'Access your secure dashboard' : 'Start managing distributed events'}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
                        {mode === 'register' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Username</Label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <Input
                                            type="text"
                                            placeholder="johndoe"
                                            className="h-12 bg-white/5 border-white/10 text-white rounded-xl pl-11 focus:ring-2 focus:ring-blue-500/50 transition-all"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            minLength={3}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <Input
                                            type="email"
                                            placeholder="name@example.com"
                                            className="h-12 bg-white/5 border-white/10 text-white rounded-xl pl-11 focus:ring-2 focus:ring-blue-500/50 transition-all"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {mode === 'login' && (
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Username</Label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <Input
                                        type="text"
                                        placeholder="Admin or user"
                                        className="h-12 bg-white/5 border-white/10 text-white rounded-xl pl-11 focus:ring-2 focus:ring-blue-500/50 transition-all"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    className="h-12 bg-white/5 border-white/10 text-white rounded-xl pl-11 focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    minLength={6}
                                    required
                                />
                            </div>
                        </div>

                        {mode === 'register' && (
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Confirm Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        className="h-12 bg-white/5 border-white/10 text-white rounded-xl pl-11 focus:ring-2 focus:ring-blue-500/50 transition-all"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl animate-in fade-in slide-in-from-top-2">
                                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl animate-in fade-in slide-in-from-top-2">
                                <Info className="w-4 h-4 flex-shrink-0" />
                                {success}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-12 bg-white text-black hover:bg-gray-100 font-bold rounded-xl shadow-xl shadow-white/5 group transition-all"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </Button>

                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase">
                                <span className="bg-[#0c0c0e]/0 backdrop-blur-none px-2 text-gray-500 font-bold tracking-widest">Or continue with</span>
                            </div>
                        </div>

                        <a
                            href="http://localhost:8000/auth/oauth2/authorization/google"
                            className="w-full h-12 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-xl flex items-center justify-center gap-3 transition-all active:scale-95 group"
                        >
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                        </a>

                        <div className="text-center pt-2">
                            <button
                                type="button"
                                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                                className="text-gray-500 text-sm hover:text-white transition-colors"
                            >
                                {mode === 'login' ? (
                                    <>Don't have an account? <span className="text-white font-bold ml-1">Sign up</span></>
                                ) : (
                                    <>Already have an account? <span className="text-white font-bold ml-1">Log in</span></>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
