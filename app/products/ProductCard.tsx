'use client';

import { Product } from '../../lib/db/types';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  useFullImg?: boolean; // plein format ou miniature
  expanded?: boolean;   // afficher toutes les infos
}

export default function ProductCard({
  product,
  onClick,
  useFullImg = false,
  expanded = false,
}: ProductCardProps) {
  return (
    <div
      className="cursor-pointer rounded overflow-hidden shadow hover:shadow-lg transition bg-white"
      onClick={onClick}
    >
      {/* Image */}
      <div className={`w-full ${useFullImg ? 'h-[600px]' : 'h-64'} overflow-hidden`}>
        <img
          src={useFullImg ? product.image || '/placeholder.png' : product.imageThumbnail || product.image || '/placeholder.png'}
          alt={product.title}
          className={`w-full h-full ${useFullImg ? 'object-contain' : 'object-cover'}`}
        />
      </div>

      {/* Infos */}
      <div className="p-2">
        <p className="font-bold text-sm truncate">{product.titleFr || product.title}</p>
        <p className="text-xs mb-1">{product.price} $</p>

        {expanded && (
          <>
            <p className="text-xs mb-1"><strong>Matériel:</strong> {product.materialFr || product.material}</p>
            <p className="text-xs mb-1"><strong>Taille:</strong> {product.size}</p>
          </>
        )}
      </div>
    </div>
  );
}
