'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SafeImage from '@/components/SafeImage';
import { useCart } from '../contexts/CartContext';
import { useI18n } from '@/i18n/I18nProvider';

export default function CartPage() {
  const { items, itemCount, removeFromCart, clearCart } = useCart();
  const { t } = useI18n();
  const router = useRouter();

  const [squareLoaded, setSquareLoaded] = useState(false);
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
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

  /* ------------------------------------------------------------------
     1️⃣ Charger Square.js (sandbox / prod)
  ------------------------------------------------------------------ */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const script = document.createElement('script');
    script.src =
      process.env.NODE_ENV === 'production'
        ? 'https://web.squarecdn.com/v1/square.js'
        : 'https://sandbox.web.squarecdn.com/v1/square.js';
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
        process.env.NEXT_PUBLIC_LOCATION_ID!
      );

      const cardInstance = await payments.card();
      await cardInstance.attach('#card-container');
      setCard(cardInstance);
    };

    init();
  }, [squareLoaded]);

  /* ------------------------------------------------------------------
     3️⃣ Calcul des totaux
  ------------------------------------------------------------------ */
  const line_items = (items || [])?.map(it => ({
    price_data: {
      currency: 'CAD',
      product_data: { name: it.titleFr || it.title },
      unit_amount: Math.round(Number(it.price || 0)),
    },
    line_total: Math.round(Number(it.price || 0))
  }));

  const total = useMemo(() => {
    return line_items.reduce((sum, item) => sum + item.line_total, 0);
  }, [line_items]);

  /* ------------------------------------------------------------------
     4️⃣ Paiement
  ------------------------------------------------------------------ */
  const handleCheckout = async () => {
    if (!card) return setError('Carte non initialisée');

    setLoading(true);
    setError(null);

    try {
      const result = await card.tokenize();
      if (result.status !== 'OK') throw new Error(result.errors?.[0]?.message || 'Tokenization failed');

      const nonce = result.token;

      const checkoutPayload = {
        sourceId: result.token,
        total,
        items,
        customerEmail: email,
        shippingMethod,
        shippingAddress: shippingMethod === 'shipping' ? address : null
      };

      const checkoutRes = await fetch('/api/square/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkoutPayload),
      });

      const data = await checkoutRes.json();
      if (!checkoutRes.ok) throw new Error(data.error || 'Erreur paiement');

      alert('Paiement réussi !');

      // 2️⃣ Mettre les produits en stock=false
      const updateStockRes = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productIds: items.map(item => item.id)
        }),
      });

      // const updateData = await updateStockRes.json();
      const raw = await updateStockRes.text();
      console.log('RAW RESPONSE:', raw);

      // if (!updateStockRes.ok) throw new Error(updateData.error || 'Erreur mise à jour stock');

      console.log('Produits mis à jour :', items.map(item => item.id));
    } catch (e: any) {
      setError(e.message || 'Erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------------------------
     5️⃣ Redirection automatique après succès
  ------------------------------------------------------------------ */
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push('/');
      }, 2000); // redirection après 2 secondes

      return () => clearTimeout(timer);
    }
  }, [success, router]);

  /* ------------------------------------------------------------------
     6️⃣ Panier vide
  ------------------------------------------------------------------ */
  const safeItems = items ?? [];
  if (safeItems.length === 0 && !success) {
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
     7️⃣ Rendu principal
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

        {success && (
          <div className="mb-4 p-3 rounded bg-green-100 text-green-800 text-center font-semibold">
            Paiement réussi 🎉 Vous allez être redirigé vers l'accueil...
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {(items || [])?.map(item => (
              <div key={item.id} className="flex bg-white p-4 rounded shadow">
                <div className="w-24 h-24 mr-4">
                  <SafeImage src={item.image} alt={item.title} />
                </div>

                <div className="flex-1">
                  <h2 className="font-semibold">{item.title}</h2>
                  <p className="text-gray-600">{item.category}</p>

                  <div className="flex items-center gap-3 mt-3">
                    <span>${item.price}</span>
                    <button onClick={() => removeFromCart(item.id)} className="text-red-600">
                      {t('actions.remove')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <br/>
            <div className="flex-1">
              <form className="grid grid-cols-1 gap-6 bg-white border border-[#cfc9c0] p-6">
                  <label className="block text-sm font-medium text-black mb-1">{t('contact.form.email')}</label>
                  <input
                    type="email"
                    className="w-full border border-[#cfc9c0] px-3 py-2 text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-[var(--leaf)]/40"
                    placeholder={t('contact.form.placeholderEmail')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <label className="block text-sm font-medium text-black mb-1">{t('contact.form.shippingMethod')}</label>
                  <label className="text-sm font-normal text-black">{t('contact.form.shippingPickup')}</label>
                  <input
                    type="radio"
                    checked={shippingMethod === 'pickup'}
                    onChange={() => setShippingMethod('pickup')}
                  />
                  <label className="text-sm font-normal text-black">{t('contact.form.shipping')}</label>
                  <input
                    type="radio"
                    checked={shippingMethod === 'shipping'}
                    onChange={() => setShippingMethod('shipping')}
                  />
                  {shippingMethod === 'shipping' && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-black mb-1">{t('contact.form.address')}</label>
                      <label className="text-sm font-normal text-black">{t('address.name')}</label>
                      <input placeholder="Nom complet" value={address.name} onChange={(e) => setAddress({ ...address, name: e.target.value })} />
                      <label className="text-sm font-normal text-black">{t('address.street')}</label>
                      <input placeholder="Adresse" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} />
                      <label className="text-sm font-normal text-black">{t('address.city')}</label>
                      <input placeholder="Ville" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
                      <label className="text-sm font-normal text-black">{t('address.province')}</label>
                      <input placeholder="Province" value={address.province} onChange={(e) => setAddress({ ...address, province: e.target.value })} />
                      <label className="text-sm font-normal text-black">{t('address.postalCode')}</label>
                      <input placeholder="Code postal" value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} />
                    </div>
                  )}
              </form>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-sm shadow p-6 h-fit">
            <h3 className="text-xl font-semibold mb-4">
              {t('cart.orderSummary')}
            </h3>

            <div className="flex justify-between">
              <span>{t('cart.total')}</span>
              <span className="font-bold">${total.toFixed(2)}</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading || !card || success}
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
