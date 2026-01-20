'use client';

import { useCart } from '../app/contexts/CartContext';
import { useState } from 'react';

export default function CheckoutButton() {
  const { items, total } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      // Préparer les items avec line_total
      const line_items = items.map((it) => ({
        id: it.id,
        title: it.title,
        price: it.price,
        quantity: it.quantity,
        line_total: Math.round(Number(it.price)) * Math.max(1, Number(it.quantity) || 1),
      }));

      const res = await fetch('/api/square/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: line_items }),
      });

      const data = await res.json();
      if (data.squareUrl) {
        window.location.href = data.squareUrl; // Redirection vers Square
      } else {
        setError(data.error || 'Erreur lors de la création du checkout');
      }
    } catch (e: any) {
      setError(e.message || 'Erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading || items.length === 0}
      className="w-full bg-[var(--gold)] text-black py-3 rounded-sm font-semibold hover:bg-[var(--gold-dark)] disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      {loading ? 'Traitement...' : `Payer ${total.toFixed(2)}$`}
    </button>
  );
}