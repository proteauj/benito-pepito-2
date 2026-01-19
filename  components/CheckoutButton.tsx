'use client';
import { useCart } from '../app/contexts/CartContext';

export default function CheckoutButton() {
  const { items } = useCart();

  const handleCheckout = async () => {
    const customerEmail = 'julie@example.com';
    const addresses = {
      billing: { line1: '123 rue', city: 'Montreal', postalCode: 'H2X1Y4', country: 'CA' },
      shipping: { line1: '123 rue', city: 'Montreal', postalCode: 'H2X1Y4', country: 'CA' }
    };

    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: items, customerEmail, addresses })
    });

    const data = await res.json();
    if (data.squareUrl) {
      window.location.href = data.squareUrl; // Redirection vers Square
    } else {
      alert('Erreur lors de la création de la commande');
    }
  };

  return <button onClick={handleCheckout}>Payer avec Square</button>;
}
