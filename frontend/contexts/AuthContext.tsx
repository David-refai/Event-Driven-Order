'use client';

import React, { createContext, useContext, useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AUTH_URL } from '@/lib/config';
import { toast } from 'sonner';


interface User {
    id: number;
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
    updateProfile: (username: string, email: string, profilePicture?: string) => Promise<User>;
    uploadProfilePicture: (file: File) => Promise<User>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
    updatePreferences: (preferences: any) => Promise<void>;
    deleteAccount: () => Promise<void>;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const fetchCurrentUser = async (authToken: string): Promise<boolean> => {
        console.log('fetchCurrentUser called with token:', authToken ? 'present' : 'missing');
        try {
            const response = await fetch(`${AUTH_URL}/auth/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            console.log('fetchCurrentUser response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('fetchCurrentUser: Full response data:', data);

                // Fallback for ID mapping just in case
                const userId = data.id !== undefined ? data.id : data.userId;

                const userData: User = {
                    id: userId,
                    username: data.username,
                    email: data.email,
                    profilePicture: data.profilePicture,
                    roles: data.roles,
                };
                console.log('fetchCurrentUser: Created userData object:', userData);
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
            // Only handle OAuth tokens that come with a specific parameter
            // Verification tokens should NOT be saved to localStorage
            const handleUrlToken = async () => {
                const urlToken = searchParams.get('token');
                const isOAuthCallback = searchParams.get('oauth') === 'true';

                if (urlToken && isOAuthCallback) {
                    // Save token to localStorage first
                    localStorage.setItem('token', urlToken);
                    setToken(urlToken);

                    // Fetch user data
                    const success = await fetchCurrentUser(urlToken);
                    if (success) {
                        toast.success('Welcome back! login successful.');
                        // Clean up URL without reload
                        const newUrl = window.location.pathname;
                        window.history.replaceState({}, '', newUrl);
                    } else {
                        console.error('Failed to fetch current user with OAuth token');
                        setToken(null);
                        localStorage.removeItem('token');
                        toast.error('Failed to login with Google');
                    }
                }
            };

            handleUrlToken();
        }, [searchParams]);

        return null;
    }

    useEffect(() => {
        const initializeAuth = async () => {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                setToken(storedToken);
                // Fetch fresh user data to ensure ID and other fields are present
                const success = await fetchCurrentUser(storedToken);
                if (!success) {
                    console.warn('Initial auth fetch failed, clearing state');
                    logout();
                }
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
            id: data.id,
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

        // Don't auto-login - user needs to verify email first
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

    const updateProfile = async (username: string, email: string, profilePicture?: string): Promise<User> => {
        const response = await fetch(`${AUTH_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ username, email, profilePicture }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update profile');
        }

        const data = await response.json();
        console.log('updateProfile: Full response data:', data);
        const userData: User = {
            id: data.id,
            username: data.username,
            email: data.email,
            profilePicture: data.profilePicture,
            roles: data.roles,
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
    };

    const uploadProfilePicture = async (file: File): Promise<User> => {
        if (!user || !user.id) {
            console.error('Upload failed: user or user.id is missing', user);
            throw new Error('User identity not found. Please try logging in again.');
        }

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${AUTH_URL}/users/${user.id}/picture`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to upload profile picture');
        }

        const data = await response.json();
        const userData: User = {
            id: data.id,
            username: data.username,
            email: data.email,
            profilePicture: data.profilePicture,
            roles: data.roles,
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
    };

    const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
        const response = await fetch(`${AUTH_URL}/auth/password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ currentPassword, newPassword }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to change password');
        }
    };

    const updatePreferences = async (preferences: any): Promise<void> => {
        const response = await fetch(`${AUTH_URL}/auth/preferences`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(preferences),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update preferences');
        }
    };

    const deleteAccount = async (): Promise<void> => {
        const response = await fetch(`${AUTH_URL}/auth/account`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete account');
        }

        logout();
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                register,
                logout,
                refreshToken,
                updateProfile,
                uploadProfilePicture,
                changePassword,
                updatePreferences,
                deleteAccount,
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
