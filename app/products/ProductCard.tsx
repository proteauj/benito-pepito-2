'use client';

import { Product } from '../../lib/db/types';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  useFullImg?: boolean;
  expanded?: boolean;
}

export default function ProductCard({ product, onClick, useFullImg = false, expanded = true }: ProductCardProps) {
  return (
    <div
      className={`cursor-pointer rounded overflow-hidden shadow hover:shadow-lg transition flex flex-col ${
        expanded ? 'h-auto' : 'h-full'
      }`}
      onClick={onClick}
    >
      <div className={`${useFullImg ? 'w-full max-h-[600px]' : 'w-full h-48'} overflow-hidden`}>
        <img
          src={useFullImg ? product.image : product.imageThumbnail || product.image || '/placeholder.png'}
          alt={product.title}
          className={`${useFullImg ? 'object-contain' : 'object-cover'} w-full h-full`}
        />
      </div>

      <div className="bg-white p-2 flex-1 flex flex-col justify-between">
        <div>
          <p className="font-bold text-sm truncate">{product.titleFr || product.title}</p>
          <p className="text-xs">{product.price} $</p>
        </div>
        {expanded && useFullImg && (
          <button className="mt-2 px-4 py-2 block w-full text-center bg-[var(--gold)] text-black font-semibold rounded hover:bg-white hover:text-[var(--leaf)]">
            Ajouter au panier
          </button>
        )}
      </div>
    </div>
  );
}