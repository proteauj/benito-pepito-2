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
  | { type: 'LOAD_CART'; payload: CartState }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'TOGGLE_CART' };

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
  isOpen: false,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  const calculateTotals = (items: CartItem[]) => ({
    total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
  });

  switch (action.type) {
    case 'ADD_TO_CART': {
      const { product } = action.payload;
      const existing = state.items.find((i) => i.id === product.id);
      const newItems = existing
        ? state.items.map((i) => (i.id === product.id ? { ...i, quantity: 1 } : i))
        : [...state.items, { ...product, quantity: 1 }];
      return { ...state, items: newItems, ...calculateTotals(newItems) };
    }

    case 'REMOVE_FROM_CART': {
      const newItems = state.items.filter((i) => i.id !== action.payload);
      return { ...state, items: newItems, ...calculateTotals(newItems) };
    }

    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      const newItems =
        quantity <= 0
          ? state.items.filter((i) => i.id !== id)
          : state.items.map((i) => (i.id === id ? { ...i, quantity } : i));
      return { ...state, items: newItems, ...calculateTotals(newItems) };
    }

    case 'CLEAR_CART':
      return { ...initialState };

    case 'LOAD_CART':
      return { ...action.payload, isOpen: false };

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
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) {
      try {
        dispatch({ type: 'LOAD_CART', payload: JSON.parse(saved) });
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state));
  }, [state]);

  const addToCart = (product: Product, quantity = 1) => {
    dispatch({ type: 'ADD_TO_CART', payload: { product, quantity } });
    dispatch({ type: 'OPEN_CART' });
  };
  const removeFromCart = (id: string) => dispatch({ type: 'REMOVE_FROM_CART', payload: id });
  const updateQuantity = (id: string, quantity: number) =>
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });
  const openCart = () => dispatch({ type: 'OPEN_CART' });
  const closeCart = () => dispatch({ type: 'CLOSE_CART' });
  const toggleCart = () => dispatch({ type: 'TOGGLE_CART' });

  return (
    <CartContext.Provider
      value={{ ...state, addToCart, removeFromCart, updateQuantity, clearCart, openCart, closeCart, toggleCart }}
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