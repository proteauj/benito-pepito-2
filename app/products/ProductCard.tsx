'use client';

import { Product } from '../../lib/db/types';
import { useCart } from '../contexts/CartContext';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  expanded?: boolean;
  useFullImage?: boolean;
}

export default function ProductCard({
  product,
  onClick,
  expanded = false,
  useFullImage = false,
}: ProductCardProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const imageSrc = useFullImage
    ? product.image || '/placeholder.png'
    : product.imageThumbnail || product.image || '/placeholder.png';

  /* =========================
     MODE EXPANDED (ProductPage)
     ========================= */
  if (expanded) {
    return (
      <div className="bg-white p-6 rounded shadow max-w-4xl mx-auto">
        {/* IMAGE */}
        <div className="flex justify-center mb-6">
          <img
            src={imageSrc}
            alt={product.title}
            className="max-h-[600px] w-auto object-contain"
          />
        </div>

        {/* INFOS */}
        <h1 className="text-2xl font-bold mb-2">
          {product.titleFr || product.title}
        </h1>

        <p className="mb-1">
          <strong>Matériel :</strong> {product.materialFr || product.material}
        </p>
        <p className="mb-1">
          <strong>Taille :</strong> {product.size}
        </p>
        <p className="mb-4">
          <strong>Prix :</strong> {product.price} $
        </p>

        {/* BOUTON PANIER */}
        <button
          onClick={() => {
            addToCart(product);
            setAdded(true);
          }}
          disabled={added}
          className={`block w-full text-center py-3 font-semibold transition
            ${
              added
                ? 'bg-[var(--gold-dark)] text-black'
                : 'bg-[var(--gold)] text-black hover:bg-white hover:text-[var(--leaf)]'
            }
          `}
        >
          {added ? 'Ajouté au panier' : 'Ajouter au panier'}
        </button>
      </div>
    );
  }

  /* =========================
     MODE GRID (Products / Home)
     ========================= */
  return (
    <div
      className="cursor-pointer rounded overflow-hidden shadow hover:shadow-lg transition bg-white"
      onClick={onClick}
    >
      <div className="w-full h-64 overflow-hidden">
        <img
          src={imageSrc}
          alt={product.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-2">
        <p className="font-bold text-sm truncate">
          {product.titleFr || product.title}
        </p>
        <p className="text-xs">{product.price} $</p>
      </div>
    </div>
  );
}