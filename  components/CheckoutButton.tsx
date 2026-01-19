'use client';

import { useCart } from '../app/contexts/CartContext';

export default function CheckoutButton() {
  const { items } = useCart();

  const handleCheckout = async () => {
    const res = await fetch('/api/square/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });

    const data = await res.json();
    if (data.squareUrl) {
      window.location.href = data.squareUrl;
    } else {
      alert('Erreur lors de la création du paiement');
    }
  };

  return <button onClick={handleCheckout}>Payer avec Square</button>;
}