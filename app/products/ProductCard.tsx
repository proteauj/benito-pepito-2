'use client';

import { Product } from '../../lib/db/types';
import { useCart } from '../contexts/CartContext';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  expanded?: boolean;       // si true, affiche toutes les infos
  useFullImage?: boolean;   // si true, affiche image haute qualité
}

export default function ProductCard({ product, onClick, expanded = false, useFullImage = false }: ProductCardProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
  };

  return (
    <div
      className={`rounded overflow-hidden shadow hover:shadow-lg transition ${expanded ? 'p-4' : 'cursor-pointer'}`}
      onClick={onClick}
    >
      <div className={expanded ? 'flex justify-center mb-4' : 'w-full h-64 overflow-hidden'}>
        <img
          src={useFullImage ? product.image || '/placeholder.png' : product.imageThumbnail || product.image || '/placeholder.png'}
          alt={product.title}
          className={expanded ? 'max-h-[600px] object-contain shadow-lg rounded' : 'w-full h-full object-cover'}
        />
      </div>

      <div className={`bg-white p-2 ${expanded ? 'shadow rounded' : ''}`}>
        <p className={`font-bold ${expanded ? 'text-2xl mb-2' : 'text-sm truncate'}`}>
          {product.titleFr || product.title}
        </p>
        <p className={`${expanded ? 'mb-2' : 'text-xs'}`}>{product.price} $</p>

        {expanded && (
          <>
            <p className="mb-2"><strong>Matériel:</strong> {product.materialFr || product.material}</p>
            <p className="mb-2"><strong>Taille:</strong> {product.size}</p>
            <button
              className={`mt-4 px-4 py-2 rounded text-white font-semibold ${added ? 'bg-green-500 cursor-default' : 'bg-yellow-500 hover:bg-yellow-600'}`}
              onClick={handleAddToCart}
              disabled={added}
            >
              {added ? 'Ajouté au panier' : 'Ajouter au panier'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}