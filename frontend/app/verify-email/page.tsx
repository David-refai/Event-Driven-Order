"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShieldCheck, XCircle, Loader2, Zap } from 'lucide-react';
import { useAuthModal } from '@/contexts/AuthModalContext';

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { openLogin, setMode } = useAuthModal();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setStatus('error');
            setMessage('Invalid or missing verification token.');
            return;
        }

        const verify = async () => {
            try {
                const response = await fetch(`http://localhost:8000/auth/verify-email?token=${token}`);
                const data = await response.json();

                if (response.ok) {
                    setStatus('success');
                    setMessage('Your email has been verified successfully! You can now log in.');
                } else {
                    setStatus('error');
                    setMessage(data.message || 'Verification failed. The token may be expired or invalid.');
                }
            } catch (err) {
                setStatus('error');
                setMessage('An error occurred during verification. Please try again later.');
            }
        };

        verify();
    }, [searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full -z-10">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-600/10 blur-[120px] rounded-full" />
            </div>

            <div className="w-full max-w-[480px] bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[40px] p-10 shadow-2xl text-center">
                <div className="mb-8 flex justify-center">
                    <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20">
                        <Zap className="w-9 h-9 text-white fill-white" />
                    </div>
                </div>

                {status === 'loading' && (
                    <div className="space-y-4">
                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
                        <h1 className="text-2xl font-bold text-white">Verifying Account</h1>
                        <p className="text-gray-400">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-500/30">
                            <ShieldCheck className="w-10 h-10 text-emerald-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-white">Verification Success!</h1>
                        <p className="text-gray-400">{message}</p>
                        <Button
                            onClick={() => {
                                router.push('/');
                                setTimeout(() => {
                                    openLogin();
                                }, 500);
                            }}
                            className="w-full h-14 bg-white text-black hover:bg-gray-100 font-bold rounded-2xl"
                        >
                            Go to Login
                        </Button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                        <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-2 border border-rose-500/30">
                            <XCircle className="w-10 h-10 text-rose-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-white">Verification Failed</h1>
                        <p className="text-gray-400">{message}</p>
                        <Button
                            onClick={() => router.push('/')}
                            variant="outline"
                            className="w-full h-14 border-white/10 text-white hover:bg-white/5 rounded-2xl font-bold"
                        >
                            Back to Home
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyEmailContent />
        </Suspense>
    );
}
