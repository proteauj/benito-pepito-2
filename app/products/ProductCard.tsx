'use client';

import { Product } from '../../lib/db/types';

interface ProductCardProps {
  product?: Product; // 👈 optionnel
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

  if (!product) {
    console.warn('ProductCard rendered without product');
    return null;
  }

  const imageSrc = useFullImage
    ? product && (product.image || product.imageThumbnail || '/placeholder.png')
    : product && (product.imageThumbnail || product.image || '/placeholder.png');

  return (
    <div
      className="cursor-pointer rounded overflow-hidden shadow hover:shadow-lg transition bg-white"
      onClick={onClick}
    >
      <div className={useFullImage ? 'w-full' : 'w-full h-64 overflow-hidden'}>
        <img
          src={imageSrc}
          alt={product.title}
          className={useFullImage ? 'w-full object-contain' : 'w-full h-full object-cover'}
        />
      </div>

      <div className="bg-white p-2">
        <p className="font-bold text-sm">{product.titleFr || product.title}</p>
        <p className="text-xs">{product.price} $</p>

        {expanded && (
          <div className="mt-2 text-sm">
            <p><strong>Matériel :</strong> {product.materialFr}</p>
            <p><strong>Taille :</strong> {product.size}</p>
          </div>
        )}
      </div>
    </div>
  );
}