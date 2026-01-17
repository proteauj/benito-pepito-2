'use client';

import { products } from '../../data/products';
import { useCart } from '../../contexts/CartContext';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import ProductCard from '../../products/ProductCard';

export default function ProductPage() {
  const params = useParams(); // next/navigation hook
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const product = products.find(p => p.id === params.id);

  if (!product) return <p>Produit introuvable</p>;

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-white">
      {/* ProductCard en mode expanded */}
      <div className="mb-6">
        <ProductCard
          product={product}
          expanded={true}        // affiche toutes les infos
          useThumbnail={false}   // image haute qualité
        />
      </div>

      {/* Bouton Ajouter au panier */}
      <div className="bg-white p-4 rounded shadow mt-4">
        <button
          onClick={handleAddToCart}
          disabled={added}
          className={`w-full px-4 py-2 font-semibold text-white rounded shadow
            ${added ? 'bg-green-500 cursor-default' : 'bg-yellow-500 hover:bg-yellow-600'}`}
        >
          {added ? 'Ajouté au panier' : 'Ajouter au panier'}
        </button>
      </div>
    </div>
  );
}