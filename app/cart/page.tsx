'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import SafeImage from '@/components/SafeImage';
import { useCart } from '../contexts/CartContext';
import { useI18n } from '@/i18n/I18nProvider';

export default function CartPage() {
  const { items, itemCount, updateQuantity, removeFromCart, clearCart } = useCart();
  const { t } = useI18n();
  const [squareLoaded, setSquareLoaded] = useState(false);
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ------------------------------------------------------------------
     1️⃣ Charger Square.js (sandbox)
  ------------------------------------------------------------------ */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const script = document.createElement('script');
    script.src =
      process.env.NODE_ENV === 'production'
        ? 'https://web.squarecdn.com/v1/square.js'
        : 'https://sandbox.web.squarecdn.com/v1/square.js';
    script.async = true;
    document.body.appendChild(script);

    script.async = true;
    script.onload = () => setSquareLoaded(true);
    script.onerror = () => setError('Échec du chargement de Square.js');

    document.body.appendChild(script);
  }, []);

  /* ------------------------------------------------------------------
     2️⃣ Initialiser la carte APRÈS rendu du conteneur
  ------------------------------------------------------------------ */
  useEffect(() => {
    if (!squareLoaded) return;

    const init = async () => {
      const el = document.getElementById('card-container');
      if (!el) return;

      const payments = window.Square.payments(
        process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID!,
        process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!
      );

      const cardInstance = await payments.card();
      await cardInstance.attach(el);
      setCard(cardInstance);
    };

    init();
  }, [squareLoaded]);
  
  const line_items = items.map(it => ({
    price_data: {
      currency: 'CAD',
      product_data: { name: it.titleFr },
      unit_amount: Math.round(Number(it.price) * 100),
    },
    quantity: Math.max(1, Number(it.quantity) || 1),
    line_total: Math.round(Number(it.price) * 100) * Math.max(1, Number(it.quantity) || 1)
  }));

  const total = useMemo(() => {
    return line_items.reduce((sum, item) => sum + item.line_total, 0);
  }, [line_items]);

  /* ------------------------------------------------------------------
     4️⃣ Paiement
  ------------------------------------------------------------------ */
  const handleCheckout = async () => {
    if (!card) {
      setError('Carte non initialisée');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await card.tokenize();
      if (result.status !== 'OK') {
        throw new Error(result.errors?.[0]?.message || 'Tokenization failed');
      }
      const nonce = result.token;

      const res = await fetch('/api/square/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId: nonce,
          total: Math.round(total * 100),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur paiement');

      alert('Paiement réussi 🎉');
      clearCart();
    } catch (err: any) {
      setError(err.message || 'Erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------------------------
     5️⃣ Panier vide
  ------------------------------------------------------------------ */
  if (items.length === 0) {
    return (
      <div className="min-h-screen stoneBg text-center py-16">
        <h1 className="text-3xl font-bold mb-4">{t('cart.emptyTitle')}</h1>
        <p className="mb-8">{t('cart.emptySubtitle')}</p>
        <Link href="/" className="bg-[var(--gold)] px-6 py-3 rounded-sm font-semibold">
          {t('cart.emptyCta')}
        </Link>
      </div>
    );
  }

  /* ------------------------------------------------------------------
     6️⃣ Rendu principal
  ------------------------------------------------------------------ */
  return (
    <div className="min-h-screen stoneBg text-[var(--foreground)]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t('cart.title')}</h1>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-100 text-red-800">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div key={item.id} className="flex bg-white p-4 rounded shadow">
                <div className="w-24 h-24 mr-4">
                  <SafeImage src={item.image} alt={item.title} />
                </div>

                <div className="flex-1">
                  <h2 className="font-semibold">{item.title}</h2>
                  <p className="text-gray-600">{item.category}</p>

                  <div className="flex items-center gap-3 mt-3">
                    <span>${item.price}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    <button onClick={() => removeFromCart(item.id)} className="text-red-600">
                      {t('actions.remove')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-white rounded-sm shadow p-6 h-fit">
            <h3 className="text-xl font-semibold mb-4">
              {t('cart.orderSummary')}
            </h3>

            {/* ✅ CONTENEUR SQUARE */}
            {squareLoaded && (
              <div
                id="square-overlay"
                style={{
                  position: 'fixed',
                  inset: 0,
                  zIndex: 99999,
                  pointerEvents: 'none', // on active seulement le form
                }}
              >
                <div
                  id="card-container"
                  style={{
                    width: '100%',
                    maxWidth: 420,
                    margin: '100px auto',
                    background: 'white',
                    padding: 16,
                    pointerEvents: 'auto', // ← CRUCIAL
                  }}
                />
              </div>
            )}

            <div className="flex justify-between mb-4">
              <span>{t('cart.total')}</span>
              <span className="text-2xl font-bold">${total.toFixed(2)}</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading || !card}
              className="w-full bg-[var(--gold)] text-black py-3 rounded-sm font-semibold"
            >
              {loading ? t('cart.processing') : t('cart.checkout')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}