"use client";

import { useEffect, useState } from "react";
import { SquareEnvironment } from "square";

export default function Checkout({ items }: { items: any[] }) {
  const [card, setCard] = useState<any>(null);

  useEffect(() => {
    async function initSquare() {
      if (!window.Square) return;

      const payments = await window.Square?.payments(
        process.env.NEXT_PUBLIC_SQUARE_APP_ID!,
        process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!
      );
      const card = await payments.card();
      await card.attach("#card-container");
      setCard(card);
    }

    initSquare();
  }, []);

  const handleCheckout = async () => {
    if (!card) return;

    const result = await card.tokenize();
    if (result.status === "OK") {
      const nonce = result.token;
      const total = items.reduce((sum, it) => sum + it.price * it.quantity * 100, 0);

      const res = await fetch("/api/square/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nonce,
          idempotencyKey: crypto.randomUUID(),
          amount: total,
        }),
      });

      const data = await res.json();
      console.log(data);
    } else {
      console.error("Erreur de tokenisation :", result.errors);
    }
  };

  return (
    <div>
      <div id="card-container"></div>
      <button onClick={handleCheckout}>Payer</button>
    </div>
  );
}
