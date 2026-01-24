"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap, ShieldCheck, ArrowRight, Loader2, Info } from 'lucide-react';
import Link from 'next/link';

function LoginContent() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login, isAuthenticated } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const message = searchParams.get('message');

    useEffect(() => {
        if (isAuthenticated) {
            router.push('/admin/dashboard');
        }
    }, [isAuthenticated, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(username, password);
            router.push('/admin/dashboard');
        } catch (err) {
            setError('Invalid credentials. Please check your username and password.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 p-6 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full -z-10">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full" />
            </div>

            <div className="w-full max-w-[440px] animate-in fade-in zoom-in-95 duration-500">
                {/* Brand Header */}
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
                        <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20 group-hover:scale-110 transition-transform">
                            <Zap className="w-7 h-7 text-white fill-white" />
                        </div>
                    </Link>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2 font-outfit">Welcome Back</h1>
                    <p className="text-gray-400">Enter your credentials to access the secure dashboard</p>
                </div>

                {/* Login Form */}
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="Admin or user"
                                className="h-14 bg-white/5 border-white/10 text-white rounded-2xl focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-600"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <Label htmlFor="password" className="text-xs font-bold text-gray-400 uppercase tracking-widest">Password</Label>
                                <a href="#" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Forgot?</a>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className="h-14 bg-white/5 border-white/10 text-white rounded-2xl focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-600"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {message && (
                            <div className="flex items-center gap-2 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-2xl animate-in fade-in slide-in-from-top-2">
                                <Info className="w-4 h-4 flex-shrink-0" />
                                {message}
                            </div>
                        )}

                        {error && (
                            <div className="flex items-center gap-2 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-2xl animate-in fade-in slide-in-from-top-2">
                                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-14 bg-white text-black hover:bg-gray-100 font-bold rounded-2xl shadow-xl shadow-white/5 group transition-all"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>

                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-[#0c0c0e] px-2 text-gray-500 font-bold tracking-widest">Or continue with</span>
                            </div>
                        </div>

                        <a
                            href="http://localhost:8000/auth/oauth2/authorization/google"
                            className="w-full h-14 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 group"
                        >
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </a>

                        <div className="text-center">
                            <p className="text-gray-500 text-sm">
                                Don't have an account?{' '}
                                <Link href="/register" className="text-white hover:text-blue-400 font-bold transition-colors">
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>

                {/* Footer Quote/Info */}
                <p className="text-center mt-12 text-xs text-gray-600 font-medium uppercase tracking-[0.2em]">
                    Secured by EventFlow Protocol &bull; 256-bit AES
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Loading...</div>}>
            <LoginContent />
        </Suspense>
    );
}
