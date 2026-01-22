"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { API_BASE_URL } from '@/lib/config';
import { Activity, Users, ShoppingCart, DollarSign, HeartPulse, ShieldCheck, ShieldAlert } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const fetcher = (url: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    }).then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
    });
};

const healthFetcher = async (url: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    try {
        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` },
            signal: AbortSignal.timeout(10000)
        });
        return res.ok ? 'online' : 'error';
    } catch {
        return 'offline';
    }
};

export default function AdminDashboard() {
    const router = useRouter();
    // Data Fetching
    const { data: users, error: usersError } = useSWR(`${API_BASE_URL}/users`, fetcher);
    const { data: orders, error: ordersError } = useSWR(`${API_BASE_URL}/api/orders/admin/all`, fetcher);
    const { data: analytics, error: analyticsError } = useSWR(`${API_BASE_URL}/api/analytics/stats`, fetcher);

    // Health Checks
    const [healthStatus, setHealthStatus] = useState<Record<string, string>>({});
    const services = [
        { name: 'API Gateway', url: `${API_BASE_URL}/actuator/health` },
        { name: 'Auth Service', url: `${API_BASE_URL}/health/auth` },
        { name: 'Order Service', url: `${API_BASE_URL}/health/orders` },
        { name: 'Analytics Service', url: `${API_BASE_URL}/health/analytics` },
    ];

    useEffect(() => {
        const checkHealth = async () => {
            const results: Record<string, string> = {};
            for (const service of services) {
                results[service.name] = await healthFetcher(service.url);
            }
            setHealthStatus(results);
        };
        checkHealth();
        // Refresh health every 30 seconds
        const interval = setInterval(checkHealth, 30000);
        return () => clearInterval(interval);
    }, []);

    const totalRevenue = orders?.reduce((acc: number, order: any) => acc + order.totalAmount, 0) || 0;

    const healthPieData = [
        { name: 'Online', value: Object.values(healthStatus).filter(v => v === 'online').length },
        { name: 'Offline/Error', value: Object.values(healthStatus).filter(v => v !== 'online').length },
    ];

    const chartData = analytics?.map((item: any) => ({
        name: item.eventType.split('.').pop(),
        count: item.eventCount
    })) || [];

    const stats = [
        {
            label: 'Total Users',
            value: users ? users.length.toString() : (usersError ? 'Error' : '...'),
            change: '+5%',
            icon: Users,
            color: 'from-blue-500 to-cyan-400'
        },
        {
            label: 'Total Orders',
            value: orders ? orders.length.toString() : (ordersError ? 'Error' : '...'),
            change: '+12%',
            icon: ShoppingCart,
            color: 'from-emerald-500 to-teal-400'
        },
        {
            label: 'Revenue',
            value: orders ? `$${totalRevenue.toLocaleString()}` : (ordersError ? 'Error' : '...'),
            change: '+8%',
            icon: DollarSign,
            color: 'from-violet-500 to-purple-400'
        },
        {
            label: 'Events Logged',
            value: analytics ? analytics.length.toString() : (analyticsError ? 'Error' : '...'),
            change: '+24%',
            icon: Activity,
            color: 'from-orange-500 to-red-400'
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 font-outfit">
                        Dashboard Overview
                    </h1>
                    <p className="text-gray-400 mt-2">Live monitoring and system analytics.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => router.push('/admin/health')}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 rounded-xl border border-gray-700 transition-all duration-200"
                    >
                        <HeartPulse className="w-4 h-4 text-rose-400" />
                        System Health
                    </button>
                    <button
                        onClick={() => router.push('/admin/analytics')}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 rounded-xl border border-gray-700 transition-all duration-200"
                    >
                        <Activity className="w-4 h-4 text-blue-400" />
                        Detailed Analytics
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="relative group p-6 bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-800 shadow-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300">
                        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${stat.color} opacity-50 group-hover:opacity-100 transition-opacity`}></div>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</p>
                                <h3 className="text-3xl font-bold text-white mt-2 font-outfit tracking-tight leading-none">{stat.value}</h3>
                            </div>
                            <div className="p-3 bg-gray-800/50 rounded-xl">
                                <stat.icon className="w-5 h-5 text-gray-300" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-1.5 line-clamp-1">
                            {usersError || ordersError || analyticsError ? (
                                <span className="text-[10px] text-rose-400 italic font-mono">Connection Refused</span>
                            ) : (
                                <>
                                    <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">
                                        {stat.change}
                                    </span>
                                    <span className="text-[10px] text-gray-500">vs last period</span>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Event Distribution Chart */}
                <div className="bg-gray-900/40 backdrop-blur-sm p-6 rounded-2xl border border-gray-800 h-[400px]">
                    <h2 className="text-lg font-bold text-white mb-6">Event Distribution</h2>
                    <ResponsiveContainer width="100%" height="85%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }}
                                itemStyle={{ color: '#F3F4F6' }}
                            />
                            <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* System Health Pie Chart */}
                <div className="bg-gray-900/40 backdrop-blur-sm p-6 rounded-2xl border border-gray-800 h-[400px] flex flex-col">
                    <h2 className="text-lg font-bold text-white mb-6">System Health Proportion</h2>
                    <div className="flex-1 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={healthPieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {healthPieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#10B981' : '#EF4444'} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-6 mt-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500" />
                            <span className="text-sm text-gray-400">Online</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-rose-500" />
                            <span className="text-sm text-gray-400">Offline</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Health Monitoring Section */}
                <div className="lg:col-span-1 bg-gray-900/40 backdrop-blur-sm p-6 rounded-2xl border border-gray-800">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-cyan-400" />
                            Service Health
                        </h2>
                        <span className="text-[10px] text-gray-500 uppercase font-mono px-2 py-0.5 bg-white/5 rounded">Live</span>
                    </div>
                    <div className="space-y-4">
                        {services.map((service) => (
                            <div key={service.name} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-xl border border-gray-800/50">
                                <span className="text-sm text-gray-300 font-medium">{service.name}</span>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-bold uppercase ${healthStatus[service.name] === 'online' ? 'text-emerald-400' :
                                        healthStatus[service.name] === 'error' ? 'text-amber-400' : 'text-rose-400'
                                        }`}>
                                        {healthStatus[service.name] || 'checking...'}
                                    </span>
                                    <div className={`w-2 h-2 rounded-full ${healthStatus[service.name] === 'online' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                                        healthStatus[service.name] === 'error' ? 'bg-amber-500' : 'bg-rose-500'
                                        }`} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Event Distribution Section */}
                <div className="lg:col-span-2 bg-gray-900/40 backdrop-blur-sm p-6 rounded-2xl border border-gray-800 overflow-hidden">
                    <h2 className="text-lg font-bold text-white mb-6">Recent Analytics Events</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-xs text-gray-500 border-b border-gray-800 uppercase tracking-wider">
                                    <th className="pb-3 px-4">Event Type</th>
                                    <th className="pb-3 px-4 text-right">Count</th>
                                    <th className="pb-3 px-4 text-center">Trend</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {analytics?.slice(0, 5).map((stat: any) => (
                                    <tr key={stat.id} className="text-sm group hover:bg-white/5 transition-colors">
                                        <td className="py-4 px-4 text-gray-300 font-medium">{stat.eventType}</td>
                                        <td className="py-4 px-4 text-right text-white font-mono">{stat.eventCount}</td>
                                        <td className="py-4 px-4">
                                            <div className="flex justify-center">
                                                <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-cyan-500 transition-all duration-1000"
                                                        style={{ width: `${Math.min(stat.eventCount, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {(!analytics || analytics.length === 0) && (
                                    <tr>
                                        <td colSpan={3} className="py-12 text-center text-gray-500 italic">
                                            <div className="flex flex-col items-center gap-2">
                                                <Activity className="w-8 h-8 opacity-20" />
                                                <span>No live events detected</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
