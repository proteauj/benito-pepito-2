'use client';
import React from 'react';
import { useCart } from '@/app/contexts/CartContext';

export default function CheckoutButton() {
  const { items } = useCart();

  const handleCheckout = async () => {
    if (items.length === 0) {
      alert('Votre panier est vide');
      return;
    }

    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });

    const data = await res.json();
    if (data.squareUrl) {
      window.location.href = data.squareUrl; // redirection vers Square
    } else {
      alert('Erreur lors de la création de la commande');
    }
  };

  return (
    <button
      onClick={handleCheckout}
      className="px-4 py-2 bg-blue-600 text-white rounded"
    >
      Payer avec Square
    </button>
  );
}