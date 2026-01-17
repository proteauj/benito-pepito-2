import React from 'react';
import { Product } from '../../lib/db/types';

interface Props {
  product: Product;
  onClick?: () => void; // ✅ Assure-toi que onClick est ici
}

export default function ProductCard({ product, onClick }: Props) {
  return (
    <div
      className="cursor-pointer border rounded overflow-hidden shadow hover:shadow-lg transition"
      onClick={onClick} // ✅ Utilisation
    >
      <div className="relative w-full h-[200px] md:h-[250px] lg:h-[300px]">
        <img
          src={product.imageThumbnail}
          alt={product.title}
          className="object-contain w-full h-full"
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <h2 className="font-semibold text-lg">{product.title}</h2>
        <p className="text-gray-600">{product.material}</p>
        <p className="mt-1 font-bold">${product.price}</p>
      </div>
    </div>
  );
}