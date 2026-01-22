export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
export const ANALYTICS_URL = process.env.NEXT_PUBLIC_ANALYTICS_URL || 'http://localhost:8085';
export const API_KEY = 'secret-api-key';

export const SERVICES = [
    { name: 'Order Service', url: 'http://localhost:8081', port: 8081 },
    { name: 'Inventory Service', url: 'http://localhost:8082', port: 8082 },
    { name: 'Payment Service', url: 'http://localhost:8083', port: 8083 },
    { name: 'Notification Service', url: 'http://localhost:8084', port: 8084 },
    { name: 'Analytics Service', url: 'http://localhost:8085', port: 8085 },
] as const;
