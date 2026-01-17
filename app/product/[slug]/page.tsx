import React from 'react';
import { Product } from '../../../lib/db/types';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <div
      className="relative cursor-pointer rounded overflow-hidden shadow hover:shadow-lg transition"
      onClick={onClick}
    >
      {/* Conteneur image avec ratio fixe */}
      <div className="w-full aspect-[4/5]">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Overlay Titre + Prix */}
      <div className="absolute bottom-0 left-0 w-full bg-white p-2">
        <h3 className="text-black font-semibold text-sm sm:text-base md:text-lg">
          {product.title}
        </h3>
        <p className="text-gray-700 text-sm">
          {product.price ? `${product.price} $` : ''}
        </p>
      </div>
    </div>
  );
}