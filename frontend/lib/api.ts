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

export interface Category {
    id: number;
    name: string;
    description: string;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    inventory: number;
    images: string[];
    category?: Category;
    createdAt?: string;
    updatedAt?: string;
}

export interface HealthStatus {
    status: 'UP' | 'DOWN' | 'UNKNOWN';
}

const getAuthHeaders = (isMultipart = false): HeadersInit => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = {
        'X-API-KEY': API_KEY,
        ...(token && { 'Authorization': `Bearer ${token}` }),
    };
    if (!isMultipart) {
        headers['Content-Type'] = 'application/json';
    }
    return headers;
};

export const apiClient = {
    async createOrder(data: { customerId: string; totalAmount: number; currency: string; items: any[] }): Promise<Order> {
        const res = await fetch(`${API_BASE_URL}/api/orders`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
            credentials: 'include',
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
            credentials: 'include',
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

    // Product & Category APIs
    async getProducts(): Promise<Product[]> {
        const res = await fetch(`${API_BASE_URL}/api/products`, {
            credentials: 'include'
        });
        if (!res.ok) throw new Error('Failed to fetch products');
        return res.json();
    },

    async getProduct(id: string): Promise<Product> {
        const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
            credentials: 'include'
        });
        if (!res.ok) throw new Error('Failed to fetch product');
        return res.json();
    },

    async createProduct(data: FormData): Promise<Product> {
        const res = await fetch(`${API_BASE_URL}/api/products`, {
            method: 'POST',
            headers: getAuthHeaders(true),
            body: data,
            credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to create product');
        return res.json();
    },

    async updateProduct(id: string, data: FormData): Promise<Product> {
        const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(true),
            body: data,
            credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to update product');
        return res.json();
    },

    async deleteProduct(id: string): Promise<void> {
        const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error('Failed to delete product');
    },

    async getCategories(): Promise<Category[]> {
        const res = await fetch(`${API_BASE_URL}/api/categories`, {
            credentials: 'include'
        });
        if (!res.ok) throw new Error('Failed to fetch categories');
        return res.json();
    },

    async createCategory(data: Partial<Category>): Promise<Category> {
        const res = await fetch(`${API_BASE_URL}/api/categories`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
            credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to create category');
        return res.json();
    }
};
