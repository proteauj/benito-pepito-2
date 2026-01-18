'use client';

import { products } from '../../data/products';
import { useParams } from 'next/navigation';
import { useCart } from '../../contexts/CartContext';
import { useState } from 'react';

export default function ProductPage() {
  const params = useParams();
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const product = products.find(p => p.id === params.id);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 bg-white">
        <p>Produit introuvable</p>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
  };

  return (
    <div className="relative z-10 bg-white">
      <div className="container mx-auto px-4 py-12">

        {/* IMAGE */}
        <div className="flex justify-center mb-10">
          <img
            src={product.image || '/placeholder.png'}
            alt={product.title}
            className="
              max-h-[70vh]
              w-auto
              object-contain
              rounded
              shadow-lg
            "
          />
        </div>

        {/* INFOS */}
        <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
          <h1 className="text-2xl font-semibold mb-4">
            {product.titleFr || product.title}
          </h1>

          <p className="mb-2">
            <strong>Matériel :</strong> {product.materialFr || product.material}
          </p>

          <p className="mb-2">
            <strong>Taille :</strong> {product.size}
          </p>

          <p className="mb-6 text-lg font-semibold">
            {product.price} $
          </p>

          {/* BOUTON */}
          <button
            onClick={handleAddToCart}
            disabled={added}
            className={`
              block w-full text-center
              py-3 font-semibold
              transition
              ${
                added
                  ? 'bg-[var(--gold-dark)] text-black cursor-default'
                  : 'bg-[var(--gold)] text-black hover:bg-white hover:text-[var(--leaf)]'
              }
            `}
          >
            {added ? 'Ajouté au panier' : 'Ajouter au panier'}
          </button>
        </div>

      </div>
    </div>
  );
}