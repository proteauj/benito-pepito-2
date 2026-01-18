'use client';

import { Product } from '../../lib/db/types';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  expanded?: boolean;          // mode page détail
  useFullImg?: boolean;        // utiliser image pleine ou thumbnail
  showAddToCart?: boolean;     // bouton Ajouter au panier
  keepImgProportions?: boolean;// respecter proportions réelles dans la galerie
}

export default function ProductCard({
  product,
  onClick,
  expanded = false,
  useFullImg = false,
  showAddToCart = false,
  keepImgProportions = false,
}: ProductCardProps) {
  return (
    <div
      className={`cursor-pointer rounded overflow-hidden shadow hover:shadow-lg transition ${expanded ? 'max-w-3xl mx-auto' : ''}`}
      onClick={onClick}
    >
      <div
        className={`w-full overflow-hidden relative ${
          expanded || keepImgProportions
            ? 'h-auto'       // conserver proportions exactes
            : 'h-64'         // galerie standard
        }`}
      >
        <img
          src={useFullImg ? product.image : product.imageThumbnail || '/placeholder.png'}
          alt={product.title}
          className={`w-full ${expanded || keepImgProportions ? 'h-auto object-contain' : 'h-full object-cover'}`}
        />
      </div>

      <div className="bg-white p-2">
        <p className="font-bold text-sm truncate">{product.titleFr || product.title}</p>
        <p className="text-xs">{product.price} $</p>

        {showAddToCart && (
          <button
            className={`block w-full text-center bg-[var(--gold)] text-black py-3 font-semibold hover:bg-white hover:text-[var(--leaf)] mt-2`}
          >
            Ajouter au panier
          </button>
        )}
      </div>
    </div>
  );
}