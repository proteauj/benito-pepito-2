'use client';

import { useEffect, useState } from 'react';
import { useCart } from '../contexts/CartContext';

export default function Cart() {
  const { items, total } = useCart();
  const [squareLoaded, setSquareLoaded] = useState(false);
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1️⃣ Charger Square.js côté client
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const script = document.createElement('script');
    script.src = 'https://sandbox.web.squarecdn.com/v1/square.js';
    script.async = true;
    script.onload = () => setSquareLoaded(true);
    script.onerror = () => setError('Échec du chargement de Square.js');
    document.body.appendChild(script);

    // Fonction de nettoyage qui ne retourne rien
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // 2️⃣ Initialiser la carte une fois Square chargé
  useEffect(() => {
    const initCard = async () => {
      if (!squareLoaded) return;

      if (!window.Square || !window.Square.payments) {
        setError('Square.js non disponible après chargement');
        return;
      }

      const appId = process.env.NEXT_PUBLIC_SQUARE_APP_ID;
      const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;
      if (!appId || !locationId) {
        setError('Variables d’environnement manquantes');
        return;
      }

      try {
        const payments = window.Square.payments(appId, 'sandbox'); // ou 'production'
        const cardInstance = await payments.card();
        await cardInstance.attach('#card-container');
        setCard(cardInstance);
      } catch (e: any) {
        setError(e.message || 'Erreur d’initialisation de la carte');
      }
    };

    initCard();
  }, [squareLoaded]);

  // 3️⃣ Fonction de paiement
  const handleCheckout = async () => {
    if (!card) return setError('Carte non initialisée');
    setLoading(true);
    setError(null);

    try {
      const result = await card.tokenize();
      if (result.status !== 'OK') throw new Error(result.errors?.[0]?.message || 'Tokenization failed');

      const nonce = result.token;
      const totalCents = Math.round(total * 100);

      const res = await fetch('/api/square/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId: nonce,
          items,
          total: totalCents,
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
    <div className="cart-container">
      <h2>Votre Panier</h2>

      {items.length === 0 ? (
        <p>Votre panier est vide</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              {item.title} - {item.quantity} x ${item.price.toFixed(2)} = $
              {(item.quantity * item.price).toFixed(2)}
            </li>
          ))}
        </ul>
      )}

      <p className="font-bold">Total: ${total.toFixed(2)}</p>

      <div id="card-container" className="mb-4"></div>
      {error && <p className="text-red-500">{error}</p>}

      <button
        onClick={handleCheckout}
        disabled={loading || items.length === 0}
        className="w-full bg-[var(--gold)] text-black py-3 rounded-sm font-semibold hover:bg-[var(--gold-dark)] disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? 'Traitement...' : `Payer ${total.toFixed(2)}$`}
      </button>
    </div>
  );
}