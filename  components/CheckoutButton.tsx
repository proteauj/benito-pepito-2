'use client';

import { Square } from 'square';
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
      if (!window.Square) {
        throw new Error('Square.js not loaded');
      }

      const line_items = items.map((it) => ({
        id: it.id,
        title: it.title,
        price: it.price,
        quantity: it.quantity,
        line_total:
          Math.round(Number(it.price)) *
          Math.max(1, Number(it.quantity) || 1),
      }));

      const payments = await window.Square.payments(process.env.NEXT_PUBLIC_SQUARE_APP_ID, process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID);
      const card = await payments.card();
      await card.attach('#card-container');

      const result = await card.tokenize();
      if (result.status !== 'OK') {
        throw new Error(result.errors?.[0]?.message || 'Tokenization failed');
      }

      const nonce = result.token;

      const res = await fetch('/api/square/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: line_items,
          sourceId: nonce,
        }),
      });

      await res.json();

      window.location.href = 'https://square.link/u/J0elT0Hw';
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