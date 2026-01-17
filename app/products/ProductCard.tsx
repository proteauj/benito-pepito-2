'use client';

import React from 'react';
import { Product } from '../../lib/db/types'; // on importe l'interface Product

interface ProductCardProps {
  product: Product;
  onClick?: () => void; // facultatif mais utile pour Swiper
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <div
      className="cursor-pointer border rounded-lg overflow-hidden shadow hover:shadow-lg transition"
      onClick={onClick}
    >
      <div className="relative w-full h-[300px] bg-gray-100 flex items-center justify-center">
        <img
          src={product.imageThumbnail}
          alt={product.title}
          className="object-contain w-full h-full"
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <h2 className="font-semibold text-lg">{product.title}</h2>
        <p className="text-sm text-gray-500">
          {product.material ? `Matière: ${product.material}` : ''}
        </p>
        <p className="font-bold mt-2">${product.price}</p>
      </div>
    </div>
  );
}
