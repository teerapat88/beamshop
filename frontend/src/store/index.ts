'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, CartItem } from '@/types';
import api from '@/lib/api';

// Auth Store
interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: { username: string; email: string; password: string; full_name?: string }) => Promise<void>;
    logout: () => void;
    setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isLoading: false,
            login: async (email, password) => {
                set({ isLoading: true });
                try {
                    const res = await api.post('/auth/login', { email, password });
                    const { token, user } = res.data;
                    localStorage.setItem('token', token);
                    set({ user, token, isLoading: false });
                } catch (err) {
                    set({ isLoading: false });
                    throw err;
                }
            },
            register: async (data) => {
                set({ isLoading: true });
                try {
                    const res = await api.post('/auth/register', data);
                    const { token, user } = res.data;
                    localStorage.setItem('token', token);
                    set({ user, token, isLoading: false });
                } catch (err) {
                    set({ isLoading: false });
                    throw err;
                }
            },
            logout: () => {
                localStorage.removeItem('token');
                set({ user: null, token: null });
            },
            setUser: (user) => set({ user }),
        }),
        { name: 'auth-storage', partialize: (state) => ({ user: state.user, token: state.token }) }
    )
);

// Cart Store
interface CartState {
    items: CartItem[];
    isLoading: boolean;
    fetchCart: () => Promise<void>;
    addToCart: (product_id: number, quantity?: number) => Promise<void>;
    updateQuantity: (cartId: number, quantity: number) => Promise<void>;
    removeItem: (cartId: number) => Promise<void>;
    clearCart: () => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()((set, get) => ({
    items: [],
    isLoading: false,
    fetchCart: async () => {
        try {
            const res = await api.get('/cart');
            set({ items: res.data.data || [] });
        } catch {
            set({ items: [] });
        }
    },
    addToCart: async (product_id, quantity = 1) => {
        await api.post('/cart', { product_id, quantity });
        await get().fetchCart();
    },
    updateQuantity: async (cartId, quantity) => {
        await api.put(`/cart/${cartId}`, { quantity });
        await get().fetchCart();
    },
    removeItem: async (cartId) => {
        await api.delete(`/cart/${cartId}`);
        set((state) => ({ items: state.items.filter((i) => i.id !== cartId) }));
    },
    clearCart: () => set({ items: [] }),
    getTotalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    getTotalPrice: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
}));
