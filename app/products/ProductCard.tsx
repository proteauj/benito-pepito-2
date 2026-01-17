'use client';

import { Product } from '../../lib/db/types';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  expanded?: boolean;       // Affiche plus d'infos si true
  useThumbnail?: boolean;   // Affiche la miniature si true, sinon image principale
}

export default function ProductCard({
  product,
  onClick,
  expanded = false,
  useThumbnail = false,
}: ProductCardProps) {
  const imgSrc = useThumbnail ? product.imageThumbnail || product.image : product.image;

  return (
    <div
      className={`cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 ${
        expanded ? 'md:h-[600px]' : ''
      }`}
      onClick={onClick}
    >
      {/* Image */}
      <div className={`w-full ${expanded ? 'h-96 md:h-[400px]' : 'h-64'} overflow-hidden`}>
        <img
          src={imgSrc || '/placeholder.png'}
          alt={product.titleFr || product.title}
          className={`w-full h-full object-cover transform ${
            expanded ? 'hover:scale-105' : ''
          } transition-transform duration-300`}
        />
      </div>

      {/* Infos */}
      <div className="bg-white p-4">
        <p className={`font-bold ${expanded ? 'text-lg' : 'text-sm'} truncate`}>
          {product.titleFr || product.title}
        </p>
        <p className={`${expanded ? 'text-md' : 'text-xs'} text-gray-700`}>
          {product.price} $
        </p>

        {expanded && (
          <>
            {product.size && <p className="text-sm text-gray-500 mt-1">Taille: {product.size}</p>}
            {product.materialFr && (
              <p className="text-sm text-gray-500">Matériel: {product.materialFr}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}