'use client';

import { useState } from 'react';
import { Product } from '../../lib/db/types';
import { useCart } from '../contexts/CartContext';

interface ProductCardProps {
  product: Product;
  expanded?: boolean;      // affiche infos complètes
  useFullImg?: boolean;    // image haute qualité
  showAddToCart?: boolean; // bouton Ajouter au panier
  onClick?: () => void;    // clic sur la carte
}

export default function ProductCard({
  product,
  expanded = false,
  useFullImg = false,
  showAddToCart = false,
  onClick,
}: ProductCardProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
  };

  return (
    <div
      className={`cursor-pointer rounded overflow-hidden shadow hover:shadow-lg transition
        ${expanded ? 'max-w-2xl mx-auto' : ''}
      `}
      onClick={onClick}
    >
      {/* Image */}
      <div className={`overflow-hidden ${expanded ? 'h-auto' : 'h-64'}`}>
        <div className="w-full h-auto max-h-[600px] overflow-hidden relative">
          <img
            src={useFullImg ? product.image : product.imageThumbnail || '/placeholder.png'}
            alt={product.title}
            className={useFullImg ? 'w-full object-contain max-h-[600px]' : 'w-full h-full object-cover'}
          />
        </div>
      </div>

      {/* Infos */}
      <div className="bg-white p-2">
        <p className="font-bold text-sm truncate">{product.titleFr || product.title}</p>
        <p className="text-xs mb-2">{product.price} $</p>

        {expanded && (
          <>
            {product.materialFr && (
              <p className="text-xs mb-1"><strong>Matériel:</strong> {product.materialFr}</p>
            )}
            {product.size && (
              <p className="text-xs mb-1"><strong>Taille:</strong> {product.size}</p>
            )}
          </>
        )}

        {/* Bouton Ajouter au panier */}
        {showAddToCart && (
          <button
            className={`block w-full text-center py-3 font-semibold rounded mt-2 transition
              ${added
                ? 'bg-gold-dark cursor-default text-black'
                : 'bg-[var(--gold)] hover:bg-white hover:text-[var(--leaf)]'}
            `}
            onClick={handleAddToCart}
            disabled={added}
          >
            {added ? 'Ajouté au panier' : 'Ajouter au panier'}
          </button>
        )}
      </div>
    </div>
  );
}