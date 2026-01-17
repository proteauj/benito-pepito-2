'use client';

import { Product } from '../../lib/db/types';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <div
      className="cursor-pointer rounded overflow-hidden shadow hover:shadow-lg transition"
      onClick={onClick}
    >
      <div className="relative w-full h-64 overflow-hidden">
        <img
          src={product.imageThumbnail || product.image || '/placeholder.png'}
          alt={product.title}
          className="object-cover w-full h-full"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-white p-2">
          <p className="font-bold text-sm">{product.title}</p>
          <p className="text-xs">{product.price} $</p>
        </div>
      </div>
    </div>
  );
}