import { API_BASE_URL, ANALYTICS_URL, API_KEY, SERVICES } from './config';

export interface Order {
    orderId: string;
    customerId: string;
    totalAmount: number;
    currency: string;
    status: string;
    createdAt: string;
}

export interface EventStat {
    eventType: string;
    count: number;
}

export interface HealthStatus {
    status: 'UP' | 'DOWN' | 'UNKNOWN';
}

const getAuthHeaders = (): HeadersInit => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
        'Content-Type': 'application/json',
        'X-API-KEY': API_KEY,
        ...(token && { 'Authorization': `Bearer ${token}` }),
    };
};

export const apiClient = {
    async createOrder(data: { customerId: string; totalAmount: number; currency: string; items: any[] }): Promise<Order> {
        const res = await fetch(`${API_BASE_URL}/api/orders`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
                throw new Error('Unauthorized - Please login');
            }
            throw new Error('Failed to create order');
        }
        return res.json();
    },

    async getOrder(orderId: string): Promise<Order> {
        const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
            headers: getAuthHeaders(),
        });
        if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
                throw new Error('Unauthorized - Please login');
            }
            throw new Error('Failed to fetch order');
        }
        return res.json();
    },

    async getAnalytics(): Promise<EventStat[]> {
        const res = await fetch(`${ANALYTICS_URL}/api/analytics/stats`);
        if (!res.ok) throw new Error('Failed to fetch analytics');
        return res.json();
    },

    async getServiceHealth(port: number): Promise<HealthStatus> {
        try {
            const res = await fetch(`http://localhost:${port}/actuator/health`);
            if (!res.ok) return { status: 'DOWN' };
            return res.json();
        } catch {
            return { status: 'DOWN' };
        }
    },
};
