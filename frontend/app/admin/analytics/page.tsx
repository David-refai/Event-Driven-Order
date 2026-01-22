"use client";

import React from 'react';
import useSWR from 'swr';
import { API_BASE_URL } from '@/lib/config';
import { Activity, BarChart3, TrendingUp } from 'lucide-react';

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

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function AnalyticsPage() {
    const { data: analytics } = useSWR(`${API_BASE_URL}/api/analytics/stats`, fetcher);

    const chartData = analytics?.map((item: any) => ({
        name: item.eventType.split('.').pop(),
        count: item.eventCount
    })) || [];

    const trendData = [
        { name: 'Mon', count: 40 },
        { name: 'Tue', count: 30 },
        { name: 'Wed', count: 60 },
        { name: 'Thu', count: 45 },
        { name: 'Fri', count: 90 },
        { name: 'Sat', count: 120 },
        { name: 'Sun', count: 80 },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-bold text-white">Advanced Analytics</h1>
                <p className="text-gray-400 mt-2">Deep dive into system event patterns.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Event Distribution Bar Chart */}
                <div className="bg-gray-900/40 backdrop-blur-sm p-6 rounded-2xl border border-gray-800 h-[450px]">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-400" />
                        Event Distribution
                    </h2>
                    <ResponsiveContainer width="100%" height="85%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }}
                                itemStyle={{ color: '#F3F4F6' }}
                            />
                            <Bar dataKey="count">
                                {chartData.map((_entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Activity Trend Area Chart */}
                <div className="bg-gray-900/40 backdrop-blur-sm p-6 rounded-2xl border border-gray-800 h-[450px]">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                        Activity Trend (Weekly)
                    </h2>
                    <ResponsiveContainer width="100%" height="85%">
                        <AreaChart data={trendData}>
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }}
                                itemStyle={{ color: '#F3F4F6' }}
                            />
                            <Area type="monotone" dataKey="count" stroke="#10B981" fillOpacity={1} fill="url(#colorCount)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Event Summary Table */}
            <div className="bg-gray-900/40 backdrop-blur-sm p-6 rounded-2xl border border-gray-800">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                    Event Summary Details
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs text-gray-500 border-b border-gray-800 uppercase tracking-wider">
                                <th className="pb-3 px-4">Event Context</th>
                                <th className="pb-3 px-4 text-right">Raw Count</th>
                                <th className="pb-3 px-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {analytics?.map((stat: any) => (
                                <tr key={stat.id} className="text-sm group hover:bg-white/5 transition-colors">
                                    <td className="py-4 px-4 text-gray-300 font-medium font-mono">{stat.eventType}</td>
                                    <td className="py-4 px-4 text-right text-white font-mono">{stat.eventCount}</td>
                                    <td className="py-4 px-4 text-center">
                                        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-[10px] font-bold">ACTIVE</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
