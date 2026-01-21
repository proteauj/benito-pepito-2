"use client";

import { useEffect, useState } from "react";
import { useCart } from "../app/contexts/CartContext";

export default function CheckoutButton() {
  const { items, total } = useCart();
  const [card, setCard] = useState<any>(null);
  const [squareLoaded, setSquareLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger Square.js côté client
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sandbox.web.squarecdn.com/v1/square.js";
    script.async = true;
    script.onload = () => setSquareLoaded(true);
    script.onerror = () => setError("Échec du chargement de Square.js");
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Initialiser la carte
  useEffect(() => {
    if (!squareLoaded) return;

    const initCard = async () => {
      if (!window.Square) {
        setError("Square.js non disponible");
        return;
      }

      const appId = process.env.NEXT_PUBLIC_SQUARE_APP_ID;
      if (!appId) {
        setError("NEXT_PUBLIC_SQUARE_APP_ID non défini");
        return;
      }

      try {
        const payments = window.Square.payments(appId, "sandbox");
        const cardInstance = await payments.card();
        await cardInstance.attach("#card-container");
        setCard(cardInstance);
      } catch (e: any) {
        setError(e.message || "Impossible d’initialiser la carte");
      }
    };

    initCard();
  }, [squareLoaded]);

  const handleCheckout = async () => {
    if (!card) {
      setError("Carte non initialisée");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await card.tokenize();
      if (result.status !== "OK") {
        throw new Error(result.errors?.[0]?.message || "Erreur de tokenisation");
      }

      const nonce = result.token;
      const amount = items.reduce((sum, it) => sum + it.price * it.quantity * 100, 0);

      const res = await fetch("/api/square/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nonce,
          idempotencyKey: crypto.randomUUID(),
          amount,
          items,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur paiement");

      alert("Paiement réussi !");
    } catch (e: any) {
      setError(e.message || "Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Votre panier</h2>
      {items.length === 0 ? (
        <p>Votre panier est vide</p>
      ) : (
        <ul className="mb-4">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between">
              <span>{item.titleFr || item.title}</span>
              <span>
                {item.quantity} x {item.price}$
              </span>
            </li>
          ))}
        </ul>
      )}

      <div id="card-container" className="mb-4 border p-2 rounded"></div>

      {error && <p className="text-red-500 mb-2">{error}</p>}

      <button
        onClick={handleCheckout}
        disabled={loading || items.length === 0}
        className="w-full bg-[var(--gold)] text-black py-3 rounded-sm font-semibold hover:bg-[var(--gold-dark)] disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? "Traitement..." : `Payer ${total.toFixed(2)}$`}
      </button>
    </div>
  );
}
