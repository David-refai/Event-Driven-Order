'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, Bell, Shield, Eye, EyeOff, Trash2, Save, Mail, Globe, Moon, Sun, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    const { user, logout, changePassword, updatePreferences, deleteAccount } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('security');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [notifications, setNotifications] = useState({
        email: true,
        orderUpdates: true,
        promotions: false,
        newsletter: true,
    });

    const [preferences, setPreferences] = useState({
        language: 'en',
        theme: 'dark',
        currency: 'USD',
    });

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Please login to access settings</h2>
                    <Link href="/" className="text-blue-400 hover:text-blue-300">Go to Home</Link>
                </div>
            </div>
        );
    }

    const handlePasswordChange = async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match!' });
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters!' });
            return;
        }

        setLoading(true);
        setMessage(null);
        try {
            await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to change password' });
        } finally {
            setLoading(false);
        }
    };

    const handleSavePreferences = async () => {
        setLoading(true);
        setMessage(null);
        try {
            await updatePreferences({
                language: preferences.language,
                theme: preferences.theme,
                currency: preferences.currency,
                notifications: notifications,
            });
            setMessage({ type: 'success', text: 'Preferences saved successfully!' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to save preferences' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            return;
        }

        setLoading(true);
        setMessage(null);
        try {
            await deleteAccount();
            router.push('/');
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to delete account' });
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'security', name: 'Security', icon: Lock },
        { id: 'notifications', name: 'Notifications', icon: Bell },
        { id: 'preferences', name: 'Preferences', icon: Globe },
        { id: 'privacy', name: 'Privacy', icon: Shield },
    ];

    return (
        <div className="min-h-screen bg-gray-950 pt-24 pb-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-black text-white mb-2">Settings</h1>
                    <p className="text-gray-400">Manage your account settings and preferences</p>
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

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-2">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="font-bold">{tab.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="lg:col-span-3">
                        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                            {/* Security Tab */}
                            {activeTab === 'security' && (
                                <div className="space-y-8">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-2">Security Settings</h2>
                                        <p className="text-gray-400">Manage your password and security preferences</p>
                                    </div>

                                    {/* Change Password */}
                                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                            <Lock className="w-5 h-5 text-blue-400" />
                                            Change Password
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-400 mb-2">Current Password</label>
                                                <div className="relative">
                                                    <input
                                                        type={showCurrentPassword ? 'text' : 'password'}
                                                        value={passwordForm.currentPassword}
                                                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                                        className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors pr-12"
                                                        placeholder="Enter current password"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                                    >
                                                        {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-400 mb-2">New Password</label>
                                                <div className="relative">
                                                    <input
                                                        type={showNewPassword ? 'text' : 'password'}
                                                        value={passwordForm.newPassword}
                                                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                                        className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors pr-12"
                                                        placeholder="Enter new password"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                                    >
                                                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-400 mb-2">Confirm New Password</label>
                                                <input
                                                    type="password"
                                                    value={passwordForm.confirmPassword}
                                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                                    className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                                    placeholder="Confirm new password"
                                                />
                                            </div>
                                            <button
                                                onClick={handlePasswordChange}
                                                disabled={loading}
                                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-xl font-bold transition-all active:scale-95 disabled:cursor-not-allowed"
                                            >
                                                <Save className="w-4 h-4" />
                                                {loading ? 'Updating...' : 'Update Password'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Two-Factor Authentication */}
                                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                                    <Shield className="w-5 h-5 text-green-400" />
                                                    Two-Factor Authentication
                                                </h3>
                                                <p className="text-sm text-gray-400 mt-1">Add an extra layer of security to your account</p>
                                            </div>
                                            <button className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all text-sm">
                                                Enable
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Notifications Tab */}
                            {activeTab === 'notifications' && (
                                <div className="space-y-8">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-2">Notification Settings</h2>
                                        <p className="text-gray-400">Choose what notifications you want to receive</p>
                                    </div>

                                    <div className="space-y-4">
                                        {Object.entries(notifications).map(([key, value]) => (
                                            <div key={key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
                                                        {key === 'email' ? <Mail className="w-5 h-5 text-blue-400" /> : <Bell className="w-5 h-5 text-blue-400" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                                                        <p className="text-sm text-gray-400">Receive {key} notifications</p>
                                                    </div>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={value}
                                                        onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={handleSavePreferences}
                                        disabled={loading}
                                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-xl font-bold transition-all active:scale-95 disabled:cursor-not-allowed"
                                    >
                                        <Save className="w-4 h-4" />
                                        {loading ? 'Saving...' : 'Save Preferences'}
                                    </button>
                                </div>
                            )}

                            {/* Preferences Tab */}
                            {activeTab === 'preferences' && (
                                <div className="space-y-8">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-2">Preferences</h2>
                                        <p className="text-gray-400">Customize your experience</p>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Language */}
                                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                                            <label className="block text-sm font-bold text-gray-400 mb-3">Language</label>
                                            <select
                                                value={preferences.language}
                                                onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                                                className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                            >
                                                <option value="en">English</option>
                                                <option value="ar">العربية</option>
                                                <option value="fr">Français</option>
                                                <option value="es">Español</option>
                                            </select>
                                        </div>

                                        {/* Theme */}
                                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                                            <label className="block text-sm font-bold text-gray-400 mb-3">Theme</label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <button
                                                    onClick={() => setPreferences({ ...preferences, theme: 'dark' })}
                                                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${preferences.theme === 'dark'
                                                            ? 'border-blue-600 bg-blue-600/10'
                                                            : 'border-white/10 hover:border-white/20'
                                                        }`}
                                                >
                                                    <Moon className="w-5 h-5 text-blue-400" />
                                                    <span className="font-bold text-white">Dark</span>
                                                </button>
                                                <button
                                                    onClick={() => setPreferences({ ...preferences, theme: 'light' })}
                                                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${preferences.theme === 'light'
                                                            ? 'border-blue-600 bg-blue-600/10'
                                                            : 'border-white/10 hover:border-white/20'
                                                        }`}
                                                >
                                                    <Sun className="w-5 h-5 text-yellow-400" />
                                                    <span className="font-bold text-white">Light</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Currency */}
                                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                                            <label className="block text-sm font-bold text-gray-400 mb-3">Currency</label>
                                            <select
                                                value={preferences.currency}
                                                onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                                                className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                            >
                                                <option value="USD">USD - US Dollar</option>
                                                <option value="EUR">EUR - Euro</option>
                                                <option value="GBP">GBP - British Pound</option>
                                                <option value="SAR">SAR - Saudi Riyal</option>
                                            </select>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSavePreferences}
                                        disabled={loading}
                                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-xl font-bold transition-all active:scale-95 disabled:cursor-not-allowed"
                                    >
                                        <Save className="w-4 h-4" />
                                        {loading ? 'Saving...' : 'Save Preferences'}
                                    </button>
                                </div>
                            )}

                            {/* Privacy Tab */}
                            {activeTab === 'privacy' && (
                                <div className="space-y-8">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-2">Privacy & Data</h2>
                                        <p className="text-gray-400">Manage your privacy and data settings</p>
                                    </div>

                                    {/* Delete Account */}
                                    <div className="bg-rose-600/10 border-2 border-rose-600/30 rounded-2xl p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-rose-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <Trash2 className="w-6 h-6 text-rose-400" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-white mb-2">Delete Account</h3>
                                                <p className="text-sm text-gray-400 mb-4">
                                                    Once you delete your account, there is no going back. Please be certain.
                                                </p>
                                                <button
                                                    onClick={handleDeleteAccount}
                                                    disabled={loading}
                                                    className="px-6 py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-gray-600 text-white rounded-xl font-bold transition-all active:scale-95 disabled:cursor-not-allowed"
                                                >
                                                    {loading ? 'Deleting...' : 'Delete My Account'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Download Data */}
                                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                                        <h3 className="text-lg font-bold text-white mb-2">Download Your Data</h3>
                                        <p className="text-sm text-gray-400 mb-4">
                                            Request a copy of your personal data
                                        </p>
                                        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all active:scale-95">
                                            Request Data Export
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
