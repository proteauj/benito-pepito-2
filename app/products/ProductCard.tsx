'use client';

import { Product } from '../../lib/db/types';
import { useCart } from '../contexts/CartContext';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  expanded?: boolean;
  useFullImg?: boolean;
  keepImgProportions?: boolean;
  onClick?: () => void;
  showAddToCart?: boolean;
  onAddToCart?: (product: Product) => void; // callback facultatif
  added?: boolean;
}

export default function ProductCard({
  product,
  expanded = false,
  useFullImg = false,
  keepImgProportions = false,
  onClick,
  showAddToCart = false,
  onAddToCart,
}: ProductCardProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // empêche le onClick du card
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      addToCart(product);
    }
    setAdded(true); // indique que le produit a été ajouté
  };

  const imgSrc = useFullImg
    ? product.image || '/placeholder.png'
    : product.imageThumbnail || product.image || '/placeholder.png';

  return (
    <div
      className={`cursor-pointer rounded overflow-hidden shadow hover:shadow-lg transition relative ${
        expanded ? 'w-full' : 'w-full sm:w-auto'
      }`}
      onClick={onClick}
    >
      <div
        className={`relative w-full ${
          keepImgProportions
            ? 'aspect-auto'
            : expanded
            ? 'h-[600px]'
            : 'aspect-square'
        } overflow-hidden`}
      >
        <img
          src={imgSrc}
          alt={product.title}
          className={`w-full h-full ${keepImgProportions ? 'object-contain' : 'object-cover'}`}
        />
      </div>

      {expanded && (
        <div
          className={`bg-white/90 p-2 mt-2`}
        >
          <p className="font-bold text-sm truncate">{product.titleFr || product.title}</p>
          <p className="text-xs">{product.materialFr || product.material}</p>
          <p className="text-xs">{product.size}</p>
          <p className="text-xs font-semibold">{product.price} $</p>

          {showAddToCart && (
            <button
              onClick={handleAddToCart}
              className={`mt-2 block w-full text-center py-3 font-semibold transition-colors ${
                added
                  ? 'bg-[var(--gold-dark)] text-black cursor-default'
                  : 'bg-[var(--gold)] text-black hover:bg-[var(--gold-dark)]'
              }`}
              disabled={added}
            >
              {added ? 'Ajouté au panier' : 'Ajouter au panier'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
