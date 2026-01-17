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
          className={`px-4 py-2 rounded text-white font-semibold ${
            added ? 'bg-green-500 cursor-default' : 'bg-blue-600 hover:bg-blue-700'
          }`}
          onClick={handleAddToCart}
          disabled={added}
        >
          {added ? 'Ajouté au panier' : 'Ajouter au panier'}
        </button>
      </div>
    </div>
  );
}