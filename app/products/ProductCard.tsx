'use client';

import { Product } from '../../lib/db/types';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;                 // Si on veut cliquer sur l'image
  useFullImg?: boolean;                 // Image pleine ou thumbnail
  showDetails?: boolean;                // Affiche bandeau avec titre/taille/prix et bouton
  onAddToCart?: () => void;             // Fonction d'ajout au panier
  added?: boolean;                      // Produit déjà ajouté
  keepImgProportions?: boolean;         // Respecte les proportions de l'image
}

export default function ProductCard({
  product,
  onClick,
  useFullImg = false,
  showDetails = false,
  onAddToCart,
  added = false,
  keepImgProportions = false,
}: ProductCardProps) {
  return (
    <div
      className="cursor-pointer rounded overflow-hidden shadow hover:shadow-lg transition bg-white"
      onClick={onClick}
    >
      {/* Image */}
      <div
        className={`w-full ${
          useFullImg
            ? 'max-h-[600px]'
            : 'h-64'
        } overflow-hidden relative`}
        style={keepImgProportions ? { height: 'auto' } : undefined}
      >
        <img
          src={useFullImg ? product.image : product.imageThumbnail || product.image || '/placeholder.png'}
          alt={product.title}
          className={`w-full h-full object-cover ${
            keepImgProportions ? 'object-contain' : ''
          }`}
        />
      </div>

      {/* Bandeau sous l'image */}
      {showDetails && (
        <div className="p-4 flex flex-col gap-2">
          <p className="font-bold text-lg truncate">{product.titleFr || product.title}</p>
          <p className="text-sm">{product.size}</p>
          <p className="text-sm">{product.materialFr}</p>
          <p className="text-sm">{product.price} $</p>

          {onAddToCart && (
            <button
              className={`block w-full text-center py-3 font-semibold transition-colors
                ${added ? 'bg-[var(--gold-dark)] cursor-default' : 'bg-[var(--gold)] hover:bg-white hover:text-[var(--leaf)]'}`}
              onClick={(e) => {
                e.stopPropagation(); // éviter de déclencher onClick parent
                if (!added) onAddToCart();
              }}
              disabled={added}
            >
              {added ? 'Ajouté au panier' : 'Ajouter au panier'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
