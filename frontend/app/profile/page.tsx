'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Calendar, Shield, Edit2, Camera, Save, X, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
    const { user, updateProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [formData, setFormData] = useState({
        username: user?.username || '',
        email: user?.email || '',
    });

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Please login to view your profile</h2>
                    <Link href="/" className="text-blue-400 hover:text-blue-300">Go to Home</Link>
                </div>
            </div>
        );
    }

    const handleSave = async () => {
        setLoading(true);
        setMessage(null);
        try {
            await updateProfile(formData.username, formData.email);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setIsEditing(false);
            setTimeout(() => setMessage(null), 3000);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            username: user.username,
            email: user.email,
        });
        setIsEditing(false);
        setMessage(null);
    };

    return (
        <div className="min-h-screen bg-gray-950 pt-24 pb-16">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-black text-white mb-2">My Profile</h1>
                    <p className="text-gray-400">Manage your account information and preferences</p>
                </div>

                {/* Success/Error Message */}
                {message && (
                    <div className={`mb-6 p-4 rounded-xl border ${message.type === 'success'
                            ? 'bg-green-600/10 border-green-600/30 text-green-400'
                            : 'bg-rose-600/10 border-rose-600/30 text-rose-400'
                        } flex items-center gap-3 animate-in slide-in-from-top duration-300`}>
                        {message.type === 'success' ? (
                            <CheckCircle className="w-5 h-5" />
                        ) : (
                            <AlertCircle className="w-5 h-5" />
                        )}
                        <span className="font-bold">{message.text}</span>
                    </div>
                )}

                {/* Profile Card */}
                <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
                    {/* Cover Image */}
                    <div className="h-48 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative">
                        <div className="absolute inset-0 bg-black/20"></div>
                    </div>

                    {/* Profile Info */}
                    <div className="px-8 pb-8">
                        {/* Avatar */}
                        <div className="relative -mt-20 mb-6">
                            <div className="relative inline-block">
                                {user.profilePicture ? (
                                    <img
                                        src={user.profilePicture}
                                        alt={user.username}
                                        className="w-32 h-32 rounded-full border-4 border-gray-900 object-cover shadow-2xl"
                                    />
                                ) : (
                                    <div className="w-32 h-32 rounded-full border-4 border-gray-900 bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-2xl">
                                        <User className="w-16 h-16 text-white" />
                                    </div>
                                )}
                                <button className="absolute bottom-2 right-2 w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors shadow-lg">
                                    <Camera className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        </div>

                        {/* Edit Button */}
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-1">{user.username}</h2>
                                <p className="text-gray-400">{user.email}</p>
                            </div>
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all active:scale-95"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Edit Profile
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSave}
                                        disabled={loading}
                                        className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-xl font-bold transition-all active:scale-95 disabled:cursor-not-allowed"
                                    >
                                        <Save className="w-4 h-4" />
                                        {loading ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        disabled={loading}
                                        className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white rounded-xl font-bold transition-all active:scale-95 disabled:cursor-not-allowed"
                                    >
                                        <X className="w-4 h-4" />
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Profile Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Username */}
                            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
                                        <User className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Username</label>
                                </div>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                ) : (
                                    <p className="text-lg font-bold text-white">{user.username}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center">
                                        <Mail className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Email</label>
                                </div>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                ) : (
                                    <p className="text-lg font-bold text-white">{user.email}</p>
                                )}
                            </div>

                            {/* Member Since */}
                            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-green-600/20 rounded-xl flex items-center justify-center">
                                        <Calendar className="w-5 h-5 text-green-400" />
                                    </div>
                                    <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Member Since</label>
                                </div>
                                <p className="text-lg font-bold text-white">January 2026</p>
                            </div>

                            {/* Role */}
                            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-rose-600/20 rounded-xl flex items-center justify-center">
                                        <Shield className="w-5 h-5 text-rose-400" />
                                    </div>
                                    <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Role</label>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {user.roles.map((role) => (
                                        <span
                                            key={role}
                                            className="px-3 py-1 bg-blue-600/20 border border-blue-600/30 text-blue-400 rounded-lg text-sm font-bold"
                                        >
                                            {role.replace('ROLE_', '')}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="mt-8 pt-8 border-t border-white/10">
                            <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Link
                                    href="/settings"
                                    className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group"
                                >
                                    <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">Settings</p>
                                        <p className="text-xs text-gray-400">Manage preferences</p>
                                    </div>
                                </Link>

                                <Link
                                    href="/wishlist"
                                    className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group"
                                >
                                    <div className="w-12 h-12 bg-rose-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-400"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">Wishlist</p>
                                        <p className="text-xs text-gray-400">View saved items</p>
                                    </div>
                                </Link>

                                <Link
                                    href="/cart"
                                    className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group"
                                >
                                    <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">My Cart</p>
                                        <p className="text-xs text-gray-400">View cart items</p>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
