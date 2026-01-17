'use client';

import { products } from '../../data/products';
import ProductCard from '../../products/ProductCard';
import { useCart } from '../../contexts/CartContext';
import { useState } from 'react';
import { Product } from '../../../lib/db/types';

interface ProductPageProps {
  params: { id: string };
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = products.find(p => p.id === params.id);
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  if (!product) return <p>Produit introuvable</p>;

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-white">
      <div className="w-full flex justify-center mb-6">
        <img
          src={product.image || '/placeholder.png'}
          alt={product.title}
          className="object-contain max-w-full max-h-[600px] shadow-lg rounded"
        />
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h1 className="text-2xl font-bold mb-2">{product.titleFr || product.title}</h1>
        <div className="mb-2">
          <span className="font-semibold">Matériel:</span> {product.materialFr || product.material}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Taille:</span> {product.size}</div>
        <div className="mb-4">
          <span className="font-semibold">Prix:</span> {product.price} $
        </div>

        <button
          onClick={handleAddToCart}
          className={`px-4 py-2 rounded text-white font-semibold ${
            added ? 'bg-green-500 cursor-default' : 'bg-blue-600 hover:bg-blue-700'
          }`}
          disabled={added}
        >
          {added ? 'Ajouté au panier' : 'Ajouter au panier'}
        </button>
      </div>
    </div>
  );
}