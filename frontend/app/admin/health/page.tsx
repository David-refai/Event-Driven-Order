"use client";

import React, { useState, useMemo } from 'react';
import { API_BASE_URL } from '@/lib/config';
import { HeartPulse, CheckCircle2, AlertCircle, RefreshCcw, Activity, Loader2, Zap } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useStatus } from '@/contexts/StatusContext';

const SERVICES_LIST = [
    { id: 'api-gateway', name: 'API Gateway', url: `${API_BASE_URL}/actuator/health`, port: 8000 },
    { id: 'auth-service', name: 'Auth Service', url: `${API_BASE_URL}/health/auth`, port: 8086 },
    { id: 'order-service', name: 'Order Service', url: `${API_BASE_URL}/health/orders`, port: 8081 },
    { id: 'inventory-service', name: 'Inventory Service', url: `${API_BASE_URL}/health/inventory`, port: 8082 },
    { id: 'payment-service', name: 'Payment Service', url: `${API_BASE_URL}/health/payments`, port: 8083 },
    { id: 'analytics-service', name: 'Analytics Service', url: `${API_BASE_URL}/health/analytics`, port: 8085 },
    { id: 'product-service', name: 'Product Service', url: `${API_BASE_URL}/health/products`, port: 8088 },
];

export default function HealthPage() {
    const { status: globalStatus, refreshAll } = useStatus();
    const [loadingServices, setLoadingServices] = useState<Record<string, 'start' | 'stop' | 'restart' | null>>({});

    const handleAction = async (action: 'start' | 'stop' | 'restart', serviceId: string, serviceName: string) => {
        const token = localStorage.getItem('token');
        setLoadingServices(prev => ({ ...prev, [serviceName]: action }));

        try {
            const res = await fetch(`${API_BASE_URL}/auth/docker/${action}/${serviceId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                const data = await res.json();
                alert(`Error: ${data.message || 'Action failed'}`);
                setLoadingServices(prev => ({ ...prev, [serviceName]: null }));
            }

            // We don't clear loading state here; we wait for globalStatus to update via SSE
            // However, for UX safety, clear it after 10s if no event received
            setTimeout(() => {
                setLoadingServices(prev => ({ ...prev, [serviceName]: null }));
            }, 10000);

        } catch (error) {
            console.error('Failed to perform action:', error);
            setLoadingServices(prev => ({ ...prev, [serviceName]: null }));
        }
    };

    const chartData = useMemo(() => [
        { name: 'Online', value: SERVICES_LIST.filter(s => globalStatus[s.id]?.state === 'ONLINE').length },
        { name: 'Issues', value: SERVICES_LIST.filter(s => globalStatus[s.id] && globalStatus[s.id]?.state !== 'ONLINE').length },
    ], [globalStatus]);

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4">
            <style jsx global>{`
                @keyframes slideLine { 0% { left: -100%; } 100% { left: 100%; } }
                .animate-slide-line { position: absolute; top: 0; height: 2px; width: 50%; animation: slideLine 1.5s infinite ease-in-out; }
                @keyframes pulse-zap { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.2); } }
                .animate-zap { animation: pulse-zap 1s infinite; }
            `}</style>

            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-rose-500/10 rounded-2xl">
                        <HeartPulse className="w-10 h-10 text-rose-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            Health Monitor
                            <Zap className="w-5 h-5 text-yellow-400 animate-zap" />
                        </h1>
                        <p className="text-gray-400 mt-1">Real-time global status synchronization powered by Docker SSE.</p>
                    </div>
                </div>
                <button
                    onClick={() => refreshAll()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-sm transition-all text-white active:scale-95 shadow-lg"
                >
                    <RefreshCcw className="w-4 h-4" />
                    Force Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-gray-900/40 backdrop-blur-sm p-8 rounded-3xl border border-gray-800 flex flex-col items-center shadow-xl">
                    <h2 className="text-xl font-bold text-white mb-8 self-start flex items-center gap-3">
                        <Activity className="w-5 h-5 text-emerald-400" />
                        Status Distribution
                    </h2>
                    <div className="w-full h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="value"
                                    isAnimationActive={true}
                                >
                                    <Cell fill="#10B981" stroke="none" />
                                    <Cell fill="#EF4444" stroke="none" />
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '12px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                        <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 text-center">
                            <div className="text-2xl font-bold text-emerald-400">{chartData[0].value}</div>
                            <div className="text-xs text-emerald-500/60 uppercase font-bold mt-1">Online</div>
                        </div>
                        <div className="p-4 bg-rose-500/5 rounded-2xl border border-rose-500/10 text-center">
                            <div className="text-2xl font-bold text-rose-400">{chartData[1].value}</div>
                            <div className="text-xs text-rose-500/60 uppercase font-bold mt-1">Issues</div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {SERVICES_LIST.map((service) => {
                        const statusObj = globalStatus[service.id];
                        const state = statusObj?.state || 'DEGRADED';
                        const loadingAction = loadingServices[service.name];

                        return (
                            <div key={service.id} className="p-6 bg-gray-900/40 backdrop-blur-sm rounded-3xl border border-gray-800 relative overflow-hidden transition-all duration-300 hover:border-gray-600 shadow-xl group">
                                {loadingAction && (
                                    <div className={`animate-slide-line ${loadingAction === 'stop' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                                )}

                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-700 ${state === 'ONLINE' ? 'bg-emerald-500' : state === 'OFFLINE' ? 'bg-rose-500' : 'bg-amber-500'
                                    }`} />

                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="font-bold text-white text-xl group-hover:text-blue-400 transition-colors">{service.name}</h3>
                                        <p className="text-xs text-gray-500 font-mono mt-1 opacity-60">ID: {service.id} • Port: {service.port}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleAction('restart', service.id, service.name)}
                                            disabled={!!loadingAction}
                                            className="p-2.5 bg-gray-800 rounded-xl hover:bg-blue-600/20 hover:text-blue-400 transition-all text-gray-400 disabled:opacity-30"
                                        >
                                            <RefreshCcw className={`w-4 h-4 ${loadingAction === 'restart' ? 'animate-spin' : ''}`} />
                                        </button>
                                        <button
                                            onClick={() => handleAction(state === 'ONLINE' ? 'stop' : 'start', service.id, service.name)}
                                            disabled={!!loadingAction}
                                            className={`p-2.5 rounded-xl transition-all text-white disabled:opacity-30 shadow-lg ${loadingAction ? 'bg-gray-700' :
                                                    state === 'ONLINE' ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                                                }`}
                                        >
                                            {loadingAction === 'start' || loadingAction === 'stop' ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Activity className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-8 p-3 bg-black/20 rounded-2xl">
                                    <div className="flex items-center gap-2">
                                        {state === 'ONLINE' ? (
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        ) : (
                                            <AlertCircle className={`w-4 h-4 ${state === 'DEGRADED' ? 'text-amber-500' : 'text-rose-500'}`} />
                                        )}
                                        <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Live Status</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {loadingAction && <span className="text-[10px] text-blue-400 animate-pulse uppercase font-black">{loadingAction}...</span>}
                                        <span className={`text-xs font-black px-4 py-1.5 rounded-full transition-all duration-700 ${state === 'ONLINE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                state === 'OFFLINE' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                            }`}>
                                            {state}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
