'use client';

import { products } from '../../data/products';
import { useCart } from '../../contexts/CartContext';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import ProductCard from '../../products/ProductCard';

export default function ProductPage() {
  const params = useParams();
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const product = products.find(p => p.id === params.id);

  if (!product) return <p className="text-center py-8">Produit introuvable</p>;

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* ProductCard en mode full + expanded */}
        <ProductCard
          product={product}
          useFullImg={true}
          expanded={true}
          onClick={() => {}}
        />

        {/* Bouton Ajouter au panier doré */}
        <div className="mt-4">
          <button
            className={`block w-full text-center py-3 font-semibold rounded ${
              added
                ? 'bg-green-500 text-black cursor-default'
                : 'bg-[var(--gold)] text-black hover:bg-white hover:text-[var(--leaf)]'
            }`}
            onClick={handleAddToCart}
            disabled={added}
          >
            {added ? 'Ajouté au panier' : 'Ajouter au panier'}
          </button>
        </div>
      </div>
    </div>
  );
}