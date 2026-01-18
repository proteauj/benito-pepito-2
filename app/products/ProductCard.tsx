'use client';

import { useState } from 'react';
import { Product } from '../../lib/db/types';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  useFullImg?: boolean;          // true pour page détail
  expanded?: boolean;            // montre titre / prix
  keepImgProportions?: boolean;  // conserve proportions
  onAddToCart?: (product: Product) => void; // ajoute au panier
  added?: boolean;
}

export default function ProductCard({
  product,
  onClick,
  useFullImg = false,
  expanded = false,
  keepImgProportions = false,
  onAddToCart
}: ProductCardProps) {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (onAddToCart) {
      onAddToCart(product);
      setAdded(true);
    }
  };

  return (
    <div
      className="cursor-pointer rounded overflow-hidden shadow hover:shadow-lg transition"
      onClick={onClick}
    >
      <div className={`w-full ${useFullImg ? '' : 'aspect-square'} overflow-hidden`}>
        <img
          src={useFullImg ? product.image : product.imageThumbnail || product.image || '/placeholder.png'}
          alt={product.title}
          className={`w-full h-full ${keepImgProportions ? 'object-contain' : 'object-cover'}`}
        />
      </div>

      {expanded && (
        <div className="bg-white p-2">
          <p className="font-bold text-sm truncate">{product.titleFr || product.title}</p>
          <p className="text-xs mb-2">{product.size}</p>
          <p className="text-xs mb-2">{product.materialFr}</p>
          <p className="text-xs mb-2">{product.price} $</p>

          {onAddToCart && (
            <button
              onClick={handleAdd}
              disabled={added}
              className={`block w-full text-center font-semibold py-3 ${
                added ? 'bg-[var(--gold-dark)] text-black cursor-default' : 'bg-[var(--gold)] text-black hover:bg-white hover:text-[var(--leaf)]'
              }`}
            >
              {added ? 'Ajouté au panier' : 'Ajouter au panier'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
