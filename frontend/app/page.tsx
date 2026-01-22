'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient, type Order, type EventStat } from '@/lib/api';
import { SERVICES } from '@/lib/config';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'orders' | 'analytics' | 'health'>('orders');
  const [orderIds, setOrderIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem('order-ids') || '[]');
  });
  const [newOrder, setNewOrder] = useState({ customerId: 'CUST-001', totalAmount: 250 });
  const [isCreating, setIsCreating] = useState(false);

  // SWR hooks for real-time data
  const { data: analytics } = useSWR<EventStat[]>(
    activeTab === 'analytics' ? 'http://localhost:8085/api/analytics/stats' : null,
    fetcher,
    { refreshInterval: 3000 }
  );

  const fetchOrders = async () => {
    const orders = await Promise.all(
      orderIds.map((id) => apiClient.getOrder(id).catch(() => null))
    );
    return orders.filter((o): o is Order => o !== null);
  };

  const { data: orders, mutate } = useSWR<Order[]>(
    activeTab === 'orders' ? 'orders-list' : null,
    fetchOrders,
    { refreshInterval: 3000 }
  );

  const createOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const result = await apiClient.createOrder({
        customerId: newOrder.customerId,
        totalAmount: newOrder.totalAmount,
        currency: 'USD',
        items: [{ productId: 'PROD-A', quantity: 1 }],
      });
      const updatedIds = [...orderIds, result.orderId];
      setOrderIds(updatedIds);
      localStorage.setItem('order-ids', JSON.stringify(updatedIds));
      mutate();
    } catch (error) {
      console.error('Failed to create order:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">EventFlow</h1>
          <p className="text-slate-300">Event-Driven Order Processing System</p>
        </header>

        <div className="flex gap-4 mb-6">
          {(['orders', 'analytics', 'health'] as const).map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab)}
              className="capitalize"
            >
              {tab}
            </Button>
          ))}
        </div>

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Order</CardTitle>
                <CardDescription>Submit a new order to the system</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={createOrder} className="space-y-4">
                  <div>
                    <Label htmlFor="customerId">Customer ID</Label>
                    <Input
                      id="customerId"
                      value={newOrder.customerId}
                      onChange={(e) => setNewOrder({ ...newOrder, customerId: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={newOrder.totalAmount}
                      onChange={(e) => setNewOrder({ ...newOrder, totalAmount: parseFloat(e.target.value) })}
                    />
                  </div>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? 'Creating...' : 'Create Order'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Total: {orders?.length || 0}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {orders?.map((order) => (
                    <div
                      key={order.orderId}
                      className="flex justify-between items-center p-4 bg-slate-800 rounded-lg"
                    >
                      <div>
                        <p className="font-mono text-sm text-slate-400">{order.orderId}</p>
                        <p className="text-white">{order.customerId}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-semibold">${order.totalAmount.toFixed(2)}</p>
                        <p className="text-xs text-slate-400">{order.status}</p>
                      </div>
                    </div>
                  ))}
                  {!orders?.length && <p className="text-slate-400 text-center py-8">No orders yet</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analytics?.map((stat) => (
              <Card key={stat.eventType}>
                <CardHeader>
                  <CardTitle className="text-lg">{stat.eventType}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-purple-400">{stat.count}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'health' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICES.map((service) => (
              <HealthCard key={service.name} service={service} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HealthCard({ service }: { service: { name: string; port: number } }) {
  const { data } = useSWR(
    `health-${service.port}`,
    () => apiClient.getServiceHealth(service.port),
    { refreshInterval: 5000 }
  );

  const isUp = data?.status === 'UP';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{service.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isUp ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className={`font-semibold ${isUp ? 'text-green-400' : 'text-red-400'}`}>
            {data?.status || 'CHECKING...'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
