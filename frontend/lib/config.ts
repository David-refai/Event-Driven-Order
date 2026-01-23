export const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export const API_BASE_URL = API_GATEWAY_URL;
export const ANALYTICS_URL = API_GATEWAY_URL;
export const AUTH_URL = API_GATEWAY_URL;
export const API_KEY = 'secret-api-key';

export const SERVICES = [
    { name: 'API Gateway', url: 'http://localhost:8000', port: 8000 },
    { name: 'Auth Service', url: 'http://localhost:8086', port: 8086 },
    { name: 'Order Service', url: 'http://localhost:8081', port: 8081 },
    { name: 'Inventory Service', url: 'http://localhost:8082', port: 8082 },
    { name: 'Payment Service', url: 'http://localhost:8083', port: 8083 },
    { name: 'Notification Service', url: 'http://localhost:8084', port: 8084 },
    { name: 'Analytics Service', url: 'http://localhost:8085', port: 8085 },
    { name: 'Product Service', url: 'http://localhost:8088', port: 8088 },
] as const;
