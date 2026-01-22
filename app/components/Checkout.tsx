"use client";

import { DatabaseService } from "@/lib/db/service";
import { SquareEnvironment } from "square";
import { useEffect, useState } from 'react';

export default function Checkout({ items }: { items: any[] }) {
  const [card, setCard] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [shippingMethod, setShippingMethod] = useState<'pickup' | 'shipping'>('pickup');

  const [address, setAddress] = useState({
    name: '',
    street: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'Canada',
  });

  useEffect(() => {
    async function initSquare() {
      if (!window.Square) return;

      const payments = await window.Square.payments(
        process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID!,
        process.env.NODE_ENV
      );
      const card = await payments.card();
      await card.attach('#card-container');
      setCard(card);
    }

    initSquare();
  }, []);

  const handleCheckout = async () => {
    if (!card || !email) return;

    if (shippingMethod === 'shipping' && !address.street) {
      alert('Adresse de livraison requise');
      return;
    }

    const result = await card.tokenize();

    if (result.status !== 'OK') {
      console.error('Erreur de tokenisation', result.errors);
      return;
    }

    const total = items.reduce((sum, it) => sum + it.price, 0);

    // 1️⃣ Appel checkout
    const checkoutRes = await fetch('/api/square/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceId: result.token,
        total,
        items,
        customerEmail: email,
        shipping: {
          method: shippingMethod,
          address: shippingMethod === 'shipping' ? address : null,
        },
      }),
    });

    const checkoutData = await checkoutRes.json();
    console.log('CHECKOUT RESPONSE', checkoutData);

    if (!checkoutRes.ok || !checkoutData.success) {
      alert('Erreur lors du paiement');
      return;
    }

    // 2️⃣ Email après succès seulement
    await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order: {
          squarePaymentId: checkoutData.payment.id,
          items,
          totalAmount: total,
          currency: 'CAD',
          shippingMethod,
          shippingAddress: shippingMethod === 'shipping' ? address : null,
        },
        customer: {
          email, // ← email du client
        },
      }),
    });

    // 3️⃣ UX
    alert('Paiement complété avec succès ✨');
  };

  return (
    <div className="space-y-6">
      {/* Email */}
      <input
        type="email"
        placeholder="Adresse courriel"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 w-full"
        required
      />

      {/* Méthode */}
      <div className="space-y-2">
        <label className="flex gap-2">
          <input
            type="radio"
            checked={shippingMethod === 'pickup'}
            onChange={() => setShippingMethod('pickup')}
          />
          Ramassage à Saint-Jean-sur-Richelieu
        </label>

        <label className="flex gap-2">
          <input
            type="radio"
            checked={shippingMethod === 'shipping'}
            onChange={() => setShippingMethod('shipping')}
          />
          Livraison
        </label>
      </div>

      {/* Adresse livraison */}
      {shippingMethod === 'shipping' && (
        <div className="space-y-2">
          <input placeholder="Nom complet" onChange={(e) => setAddress({ ...address, name: e.target.value })} />
          <input placeholder="Adresse" onChange={(e) => setAddress({ ...address, street: e.target.value })} />
          <input placeholder="Ville" onChange={(e) => setAddress({ ...address, city: e.target.value })} />
          <input placeholder="Province" onChange={(e) => setAddress({ ...address, province: e.target.value })} />
          <input placeholder="Code postal" onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} />
        </div>
      )}

      <div id="card-container"></div>

      <button onClick={handleCheckout} className="bg-black text-white px-4 py-2">
        Payer
      </button>
    </div>
  );
}

