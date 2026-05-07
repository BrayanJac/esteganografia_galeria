import { create } from 'zustand';
import { User } from '@types/index';

interface AuthStore {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
    setUser: (user: User) => void;
    setLoading: (loading: boolean) => void;
    initializeAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,

    login: (user: User, token: string) => {
        localStorage.setItem('access_token', token);
        localStorage.setItem('user', JSON.stringify(user));
        set({ user, isAuthenticated: true, isLoading: false });
    },

    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        set({ user: null, isAuthenticated: false, isLoading: false });
    },

    setUser: (user: User) => {
        set({ user });
    },

    setLoading: (loading: boolean) => {
        set({ isLoading: loading });
    },

    initializeAuth: () => {
        const token = localStorage.getItem('access_token');
        const userStr = localStorage.getItem('user');

        if (token && userStr) {
            try {
                const user = JSON.parse(userStr);
                set({ user, isAuthenticated: true, isLoading: false });
            } catch {
                set({ isLoading: false });
            }
        } else {
            set({ isLoading: false });
        }
    },
}));
