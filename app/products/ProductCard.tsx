'use client';

import { Product } from '../../lib/db/types';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  variant?: 'mini' | 'full'; // nouveau prop
}

export default function ProductCard({ product, onClick, variant = 'mini' }: ProductCardProps) {
  const isFull = variant === 'full';

  return (
    <div
      className={`cursor-pointer rounded overflow-hidden shadow hover:shadow-lg transition ${
        isFull ? 'bg-white p-6' : ''
      }`}
      onClick={onClick}
    >
      <div className={`relative w-full ${isFull ? 'h-auto flex justify-center' : 'h-64 overflow-hidden'}`}>
        <img
          src={product.image || '/placeholder.png'}
          alt={product.title}
          className={`object-cover ${isFull ? 'object-contain max-h-[600px]' : 'w-full h-full'}`}
        />
      </div>

      <div className={`absolute bottom-0 left-0 right-0 ${isFull ? 'relative bg-white bg-opacity-100 p-4 mt-4' : 'bg-white bg-opacity-90 p-2'}`}>
        <p className={`${isFull ? 'text-xl font-bold' : 'font-bold text-sm'}`}>{product.titleFr || product.title}</p>
        <p className={`${isFull ? 'text-lg' : 'text-xs'}`}>{product.price} $</p>

        {isFull && (
          <div className="mt-2 space-y-1">
            <p><span className="font-semibold">Matériel: </span>{product.materialFr || product.material}</p>
            <p><span className="font-semibold">Taille: </span>{product.size}</p>
            <p><span className="font-semibold">Année: </span>{product.year}</p>
            <p><span className="font-semibold">Catégorie: </span>{product.category}</p>
            <p className={product.inStock ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
              {product.inStock ? 'En stock' : 'Rupture de stock'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}