"use client";

import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/config';
import { HeartPulse, CheckCircle2, AlertCircle, RefreshCcw, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

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

export default function HealthPage() {
    const [healthStatus, setHealthStatus] = useState<Record<string, string>>({});
    const [isRefreshing, setIsRefreshing] = useState(false);

    const services = [
        { name: 'API Gateway', url: `${API_BASE_URL}/actuator/health`, port: 8000 },
        { name: 'Auth Service', url: `${API_BASE_URL}/health/auth`, port: 8086 },
        { name: 'Order Service', url: `${API_BASE_URL}/health/orders`, port: 8081 },
        { name: 'Inventory Service', url: `${API_BASE_URL}/health/inventory`, port: 8082 },
        { name: 'Payment Service', url: `${API_BASE_URL}/health/payments`, port: 8083 },
        { name: 'Analytics Service', url: `${API_BASE_URL}/health/analytics`, port: 8085 },
    ];

    const checkAllHealth = async () => {
        setIsRefreshing(true);
        const results: Record<string, string> = {};
        for (const service of services) {
            results[service.name] = await healthFetcher(service.url);
        }
        setHealthStatus(results);
        setIsRefreshing(false);
    };

    useEffect(() => {
        checkAllHealth();
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <HeartPulse className="w-8 h-8 text-rose-500" />
                        System Health Monitor
                    </h1>
                    <p className="text-gray-400 mt-2">Real-time status tracking for all microservices.</p>
                </div>
                <button
                    onClick={checkAllHealth}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 border border-gray-700 rounded-xl text-sm transition-all"
                >
                    <RefreshCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh Status
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-gray-900/40 backdrop-blur-sm p-6 rounded-2xl border border-gray-800 flex flex-col items-center">
                    <h2 className="text-xl font-bold text-white mb-6 self-start flex items-center gap-2">
                        <Activity className="w-5 h-5 text-emerald-400" />
                        System Overview
                    </h2>
                    <div className="w-full h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Online', value: Object.values(healthStatus).filter(v => v === 'online').length },
                                        { name: 'Issues', value: Object.values(healthStatus).filter(v => v !== 'online').length },
                                    ]}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    <Cell fill="#10B981" />
                                    <Cell fill="#EF4444" />
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {services.map((service) => {
                        const status = healthStatus[service.name];
                        return (
                            <div key={service.name} className="p-6 bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-800 relative overflow-hidden group">
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${status === 'online' ? 'bg-emerald-500' : status === 'error' ? 'bg-amber-500' : 'bg-rose-500'
                                    }`} />

                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-white text-lg">{service.name}</h3>
                                        <p className="text-xs text-gray-500 font-mono mt-1">Port: {service.port}</p>
                                    </div>
                                    {status === 'online' ? (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    ) : (
                                        <AlertCircle className={`w-5 h-5 ${status === 'error' ? 'text-amber-500' : 'text-rose-500'}`} />
                                    )}
                                </div>

                                <div className="flex items-center justify-between mt-6">
                                    <span className="text-xs text-gray-400 uppercase tracking-widest">Status</span>
                                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${status === 'online' ? 'bg-emerald-500/10 text-emerald-400' :
                                        status === 'error' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                                        }`}>
                                        {status?.toUpperCase() || 'FETCHING...'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
