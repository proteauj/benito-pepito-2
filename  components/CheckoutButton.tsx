'use client';

import { useEffect, useState } from 'react';
import { useCart } from '../app/contexts/CartContext';

export default function CheckoutButton() {
  const { items, total } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [squareLoaded, setSquareLoaded] = useState(false);
  const [card, setCard] = useState<any>(null);

  // Charger Square.js
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

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Initialiser la carte une fois Square chargé
  useEffect(() => {
    const initCard = async () => {
      if (!squareLoaded) return;

      if (!window.Square) {
        setError('Square.js non disponible après chargement');
        return;
      }

      const appId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID;
      const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;

      if (!appId || !locationId) {
        setError('Variables NEXT_PUBLIC_SQUARE_APP_ID ou NEXT_PUBLIC_SQUARE_LOCATION_ID manquantes');
        return;
      }

      try {
        const payments = window.Square.payments(appId, 'sandbox'); // ou 'production'
        const cardInstance = await payments.card();
        await cardInstance.attach('#card-container');
        setCard(cardInstance);
      } catch (e: any) {
        setError(e.message || 'Erreur lors de l’initialisation de la carte');
      }
    };

    initCard();
  }, [squareLoaded]);

  const handleCheckout = async () => {
    if (!card) return setError('Carte non initialisée');

    setLoading(true);
    setError(null);

    try {
      const result = await card.tokenize();
      if (result.status !== 'OK') throw new Error(result.errors?.[0]?.message || 'Tokenization failed');

      const nonce = result.token;

      const res = await fetch('/api/square/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId: nonce,
          items,
          total: total * 100,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur paiement');

      alert('Paiement réussi !');
    } catch (e: any) {
      setError(e.message || 'Erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div id="card-container" className="mb-4"></div>
      {error && <p className="text-red-500">{error}</p>}
      <button
        onClick={handleCheckout}
        disabled={loading || items.length === 0}
        className="w-full bg-[var(--gold)] text-black py-3 rounded-sm font-semibold hover:bg-[var(--gold-dark)] disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? 'Traitement...' : `Payer ${total.toFixed(2)}$`}
      </button>
    </>
  );
}