"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/lib/config';

interface OrderItem {
    productId: string;
    quantity: number;
}

interface Order {
    orderId: string;
    customerId: string; // This is actually the userId in our current impl
    status: string;
    totalAmount: number;
    currency: string;
    createdAt: string;
    items: OrderItem[];
}

export default function OrdersPage() {
    const { token } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/orders/admin/all`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.ok) {
                    const data = await response.json();
                    setOrders(data);
                }
            } catch (error) {
                console.error('Failed to fetch orders', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, [token]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Global Orders</h1>
                <span className="text-gray-400 text-sm">{orders.length} Orders</span>
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-xl">
                <table className="w-full text-left text-gray-300">
                    <thead className="bg-gray-900/50 text-xs uppercase text-gray-400 font-semibold">
                        <tr>
                            <th className="px-6 py-4">Order ID</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {orders.map((order) => (
                            <tr key={order.orderId} className="hover:bg-gray-700/50 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs text-gray-400 truncate max-w-[150px]" title={order.orderId}>
                                    {order.orderId.substring(0, 8)}...
                                </td>
                                <td className="px-6 py-4 text-white font-medium">{order.customerId}</td>
                                <td className="px-6 py-4 text-sm">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 font-bold text-emerald-400">
                                    {order.totalAmount.toFixed(2)} {order.currency}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${order.status === 'COMPLETED' ? 'bg-green-900/30 text-green-400 border border-green-700/50' :
                                            order.status === 'CREATED' ? 'bg-blue-900/30 text-blue-400 border border-blue-700/50' :
                                                'bg-gray-700 text-gray-400'
                                        }`}>
                                        {order.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
