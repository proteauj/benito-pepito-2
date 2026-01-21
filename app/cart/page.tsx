"use client";

import { useEffect, useState } from "react";
import { useCart } from "../contexts/CartContext"; // Ton contexte panier
import { SquareEnvironment } from "square";

export default function CheckoutButton() {
  const { items, total } = useCart();
  const [card, setCard] = useState<any>(null);
  const [squareLoaded, setSquareLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger le script Square côté client
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sandbox.web.squarecdn.com/v1/square.js";
    script.async = true;
    document.body.appendChild(script);

    // Fonction de nettoyage
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Initialiser la carte une fois le script chargé
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
        const payments = window.Square.payments(appId, SquareEnvironment.Production);
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
      // Tokeniser la carte
      const result = await card.tokenize();
      if (result.status !== "OK") {
        throw new Error(result.errors?.[0]?.message || "Erreur de tokenisation");
      }

      const nonce = result.token;

      // Calcul du total en centimes
      const amount = items.reduce(
        (sum, it) => sum + it.price * it.quantity * 100,
        0
      );

      // Envoi du nonce et montant au backend
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
      <div id="card-container" className="mb-4"></div>
      {error && <p className="text-red-500">{error}</p>}
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
