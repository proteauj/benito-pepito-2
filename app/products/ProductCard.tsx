'use client';

import { Product } from '../../lib/db/types';
import { useCart } from '../contexts/CartContext';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  expanded?: boolean;      // afficher tous les détails
  useFullImg?: boolean;    // image complète ou thumbnail
}

export default function ProductCard({
  product,
  onClick,
  expanded = false,
  useFullImg = false,
}: ProductCardProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
  };

  return (
    <div
      className={`bg-white cursor-pointer rounded overflow-hidden shadow hover:shadow-lg transition ${expanded ? 'max-w-2xl mx-auto' : ''}`}
      onClick={onClick}
    >
      <div className={`${expanded ? 'w-full h-[600px]' : 'w-full h-64'} overflow-hidden`}>
        <img
          src={useFullImg ? product.image || '/placeholder.png' : product.imageThumbnail || product.image || '/placeholder.png'}
          alt={product.title}
          className={`${expanded ? 'object-contain' : 'object-cover'} w-full h-full`}
        />
      </div>

      <div className="bg-white p-2">
        <p className="font-bold text-sm truncate">{product.titleFr || product.title}</p>
        <p className="text-xs mb-2">{product.price} $</p>

        {expanded && (
          <div className="mt-2">
            <p><strong>Matériel:</strong> {product.materialFr || product.material}</p>
            <p><strong>Taille:</strong> {product.size}</p>
            <button
              className={`block w-full text-center bg-[var(--gold)] text-black py-3 font-semibold hover:bg-white hover:text-[var(--leaf)] mt-4`}
              onClick={handleAddToCart}
              disabled={added}
            >
              {added ? 'Ajouté au panier' : 'Ajouter au panier'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
