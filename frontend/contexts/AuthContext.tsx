'use client';

import React, { createContext, useContext, useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AUTH_URL } from '@/lib/config';

interface User {
    username: string;
    email: string;
    profilePicture?: string;
    roles: string[];
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    refreshToken: () => Promise<void>;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const fetchCurrentUser = async (authToken: string) => {
        console.log('fetchCurrentUser called with token:', authToken.substring(0, 20) + '...');
        try {
            const response = await fetch(`${AUTH_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
            });
            console.log('fetchCurrentUser response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('fetchCurrentUser data received:', data);
                const userData: User = {
                    username: data.username,
                    email: data.email,
                    profilePicture: data.profilePicture,
                    roles: data.roles,
                };
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                console.log('fetchCurrentUser: User data saved to state and localStorage');
                return true;
            } else {
                const errorText = await response.text();
                console.error('fetchCurrentUser failed:', response.status, errorText);
            }
        } catch (error) {
            console.error('Error fetching current user:', error);
        }
        return false;
    };

    // Component to handle URL tokens specifically
    function AuthTokenHandler() {
        const searchParams = useSearchParams();

        useEffect(() => {
            const handleUrlToken = async () => {
                const urlToken = searchParams.get('token');
                if (urlToken) {
                    console.log('Detected token in URL, initializing OAuth session...');
                    setToken(urlToken);
                    localStorage.setItem('token', urlToken);

                    const success = await fetchCurrentUser(urlToken);
                    if (success) {
                        const newUrl = window.location.pathname;
                        window.history.replaceState({}, '', newUrl);
                        // Force reload to ensure UI updates
                        window.location.reload();
                    } else {
                        console.error('Failed to fetch current user with OAuth token');
                    }
                }
            };
            handleUrlToken();
        }, [searchParams]);

        return null;
    }

    useEffect(() => {
        const initializeAuth = async () => {
            // Check localStorage
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
            setIsLoading(false);
        };

        initializeAuth();
    }, []);

    const login = async (username: string, password: string) => {
        const response = await fetch(`${AUTH_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        const data = await response.json();

        const userData: User = {
            username: data.username,
            email: data.email,
            profilePicture: data.profilePicture,
            roles: data.roles,
        };

        setToken(data.token);
        setUser(userData);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const register = async (username: string, email: string, password: string) => {
        const response = await fetch(`${AUTH_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Registration failed');
        }

        // Auto-login after registration
        await login(username, password);
    };

    const refreshToken = async () => {
        try {
            const response = await fetch(`${AUTH_URL}/auth/refreshtoken`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setToken(data.accessToken);
                localStorage.setItem('token', data.accessToken);
            } else {
                logout();
            }
        } catch (err) {
            logout();
        }
    };

    const logout = async () => {
        try {
            await fetch(`${AUTH_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch (err) {
            console.error('Logout failed', err);
        }
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
    };

    // Auto-refresh token every 4 minutes (before it expires at 5 mins)
    useEffect(() => {
        if (!token) return;

        const refreshInterval = setInterval(() => {
            console.log('Refreshing access token...');
            refreshToken();
        }, 4 * 60 * 1000);

        return () => clearInterval(refreshInterval);
    }, [token]);

    // Inactivity Timeout Logic (5 minutes)
    useEffect(() => {
        if (!token) return;

        let timeoutId: NodeJS.Timeout;

        const resetTimer = () => {
            if (timeoutId) clearTimeout(timeoutId);
            // 5 minutes = 5 * 60 * 1000 ms
            timeoutId = setTimeout(() => {
                console.log('User inactive for 5 minutes, logging out...');
                logout();
            }, 5 * 60 * 1000);
        };

        // Events that indicate activity
        const activities = ['mousemove', 'keydown', 'click', 'scroll'];

        activities.forEach(event => {
            window.addEventListener(event, resetTimer);
        });

        // Initial timer set
        resetTimer();

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            activities.forEach(event => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, [token]);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                register,
                logout,
                refreshToken,
                isAuthenticated: !!token,
                isLoading,
            }}
        >
            <Suspense fallback={null}>
                <AuthTokenHandler />
            </Suspense>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
