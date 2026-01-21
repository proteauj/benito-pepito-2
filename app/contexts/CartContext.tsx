'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Product } from '@/lib/db/types';

interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  isOpen: boolean;
}

type CartAction =
  | { type: 'ADD_TO_CART'; payload: { product: Product; quantity: number } }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: { items: CartItem[] } } // seulement les items
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'TOGGLE_CART' };

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
  isOpen: false,
};

function calculateTotals(items: CartItem[]) {
  return {
    total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
  };
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const { product, quantity } = action.payload;
      const existing = state.items.find((i) => i.id === product.id);
      const newItems = existing
        ? state.items.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i))
        : [...state.items, { ...product, quantity }];
      return { ...state, items: newItems, ...calculateTotals(newItems) };
    }

    case 'REMOVE_FROM_CART': {
      const newItems = state.items.filter((i) => i.id !== action.payload);
      return { ...state, items: newItems, ...calculateTotals(newItems) };
    }

    case 'CLEAR_CART':
      return { ...initialState };

    case 'LOAD_CART': {
      const items = action.payload.items || [];
      return { items, ...calculateTotals(items), isOpen: false };
    }

    case 'OPEN_CART':
      return { ...state, isOpen: true };
    case 'CLOSE_CART':
      return { ...state, isOpen: false };
    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen };

    default:
      return state;
  }
}

interface CartContextType extends CartState {
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Charger seulement les items depuis le localStorage
  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'LOAD_CART', payload: { items: parsed.items || [] } });
      } catch {}
    }
  }, []);

  // Sauvegarder uniquement les items
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify({ items: state.items }));
  }, [state.items]);

  const addToCart = (product: Product, quantity = 1) => {
    dispatch({ type: 'ADD_TO_CART', payload: { product, quantity } });
    dispatch({ type: 'OPEN_CART' });
  };
  const removeFromCart = (id: string) => dispatch({ type: 'REMOVE_FROM_CART', payload: id });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });
  const openCart = () => dispatch({ type: 'OPEN_CART' });
  const closeCart = () => dispatch({ type: 'CLOSE_CART' });
  const toggleCart = () => dispatch({ type: 'TOGGLE_CART' });

  return (
    <CartContext.Provider
      value={{ ...state, addToCart, removeFromCart, clearCart, openCart, closeCart, toggleCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
