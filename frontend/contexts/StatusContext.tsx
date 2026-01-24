"use client";

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { API_BASE_URL } from "@/lib/config";

import { useAuth } from "@/contexts/AuthContext";

type State = "ONLINE" | "OFFLINE" | "DEGRADED";
type StatusMap = Record<string, { state: State; ts: number }>;

interface StatusContextType {
    status: StatusMap;
    refreshAll: () => Promise<void>;
}

const StatusCtx = createContext<StatusContextType>({ status: {}, refreshAll: async () => { } });

export function StatusProvider({ children }: { children: React.ReactNode }) {
    const { token } = useAuth();
    const [status, setStatus] = useState<StatusMap>({});

    const refreshAll = useCallback(async () => {
        if (!token) return;

        try {
            const res = await fetch(`${API_BASE_URL}/auth/docker/summary`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                const ts = Date.now();
                const next: StatusMap = {};
                for (const [svc, st] of Object.entries(data)) {
                    next[svc] = { state: st as State, ts };
                }
                setStatus(next);
            }
        } catch (error) {
            console.error("Failed to fetch status summary:", error);
        }
    }, [token]);

    useEffect(() => {
        let es: EventSource | null = null;
        let pollTimer: NodeJS.Timeout | null = null;

        if (!token) {
            setStatus({}); // Reset status on logout
            return;
        }

        const startPolling = () => {
            if (pollTimer) return;
            console.log("Starting fallback polling...");
            pollTimer = setInterval(refreshAll, 10000);
        };

        const stopPolling = () => {
            if (pollTimer) {
                clearInterval(pollTimer);
                pollTimer = null;
            }
        };

        const connect = () => {
            // Using the new SSE endpoint with token param
            es = new EventSource(`${API_BASE_URL}/auth/docker/events?token=${token}`);

            es.addEventListener('docker-event', (e) => {
                stopPolling();
                try {
                    const data = JSON.parse(e.data);
                    const containerName: string = data.name;
                    const containerStatus: string = data.status;

                    console.log(`[SSE Event] Service: ${containerName}, Status: ${containerStatus}`);

                    // Robust mapping: try to find the service ID in the container name
                    const knownServices = ["api-gateway", "auth-service", "order-service", "inventory-service", "payment-service", "analytics-service", "product-service"];
                    const foundService = knownServices.find(s => containerName.includes(s));

                    if (foundService) {
                        let newState: State = "DEGRADED";

                        // Treat 'die', 'stop', 'kill' as OFFLINE
                        if (['die', 'stop', 'kill'].includes(containerStatus)) newState = "OFFLINE";
                        // Treat 'start', 'restart', 'unpause' as ONLINE
                        if (['start', 'restart', 'unpause'].includes(containerStatus)) newState = "ONLINE";

                        console.log(`[SSE Update] ${foundService} -> ${newState}`);

                        if (newState !== "DEGRADED") {
                            setStatus(prev => ({
                                ...prev,
                                [foundService]: { state: newState, ts: Date.now() }
                            }));
                        }
                    }
                } catch (err) {
                    console.error("Failed to parse docker event:", err);
                }
            });

            es.onerror = () => {
                console.warn("SSE connection lost. Switching to polling...");
                es?.close();
                startPolling();
                // Attempt to reconnect after 30 seconds
                setTimeout(connect, 30000);
            };
        };

        refreshAll(); // Initial fetch
        connect();

        return () => {
            stopPolling();
            es?.close();
        };
    }, [refreshAll, token]);

    const value = useMemo(() => ({ status, refreshAll }), [status, refreshAll]);

    return <StatusCtx.Provider value={value}>{children}</StatusCtx.Provider>;
}

export function useStatus() {
    return useContext(StatusCtx);
}

export function useServiceState(serviceId: string): State {
    const { status } = useStatus();
    return status[serviceId]?.state ?? "DEGRADED";
}
