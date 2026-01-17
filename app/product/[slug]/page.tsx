import React from 'react';
import { Product } from '../../../lib/db/types';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <div
      className="relative cursor-pointer overflow-hidden rounded shadow hover:shadow-lg transition"
      onClick={onClick}
    >
      {/* Image responsive sans hauteur fixe */}
      <img
        src={product.image}
        alt={product.title}
        className="w-full h-auto object-cover"
      />

      {/* Overlay titre + prix sur fond blanc */}
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
