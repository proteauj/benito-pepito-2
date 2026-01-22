'use client';

import { useEffect, useState } from 'react';
import { Product } from '../../lib/db/types';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  useFullImg?: boolean;
  expanded?: boolean;
  keepImgProportions?: boolean;
  onAddToCart?: (product: Product) => void;
  added?: boolean;
  className?: string; // <-- ajouter
}

export default function ProductCard({
  product,
  onClick,
  useFullImg = false,
  expanded = false,
  keepImgProportions = false,
  onAddToCart,
  className
}: ProductCardProps) {
  const [added, setAdded] = useState(false);
  const [realStock, setRealStock] = useState(product.inStock);

  const handleAdd = () => {
    if (onAddToCart) {
      onAddToCart(product);
      setAdded(true);
    }
  };

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const res = await fetch(`/api/products?id=${product.id}`);
        const data = await res.json();
        setRealStock(data.inStock);
      } catch (err) {
        console.error('Erreur récupération stock', err);
      }
    };

    fetchStock();
  }, [product.id]);

  return (
    <>
        <div
          className={`
            relative z-10 cursor-pointer rounded overflow-hidden shadow hover:shadow-lg transition ${className}
          `}
          onClick={onClick}
        >
        <div
          className={`
            w-75 overflow-hidden mx-auto
            ${!useFullImg && !keepImgProportions ? 'aspect-square' : ''}
          `}
        >
          <img
            src={useFullImg ? product.image : product.imageThumbnail || product.image || '/placeholder.png'}
            alt={product.titleFr}
            className={`
              relative z-10 w-full
              ${keepImgProportions ? 'h-auto object-contain' : 'h-full object-cover'}
            `}
          />
        </div>

        {expanded && (
          <div className="bg-white p-2">
            <p className="font-bold text-sm truncate">{product.titleFr || product.title}</p>
            <p className="text-xs mb-2">{product.size}</p>
            <p className="text-xs mb-2">{product.materialFr}</p>
            <p className="text-xs mb-2">{product.price} $</p>

            {/* BADGE VENDU — TOUJOURS ACTIF */}
            {!realStock && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
                <span className="bg-[var(--gold)] text-black px-4 py-2 font-semibold">
                  VENDU
                </span>
              </div>
            )}

            {onAddToCart && realStock && (
              <button
                onClick={handleAdd}
                disabled={added}
                className={`block w-full text-center font-semibold py-3 ${
                  added ? 'bg-[var(--gold-dark)] text-black cursor-default' : 'bg-[var(--gold)] text-black hover:bg-white hover:text-[var(--leaf)]'
                }`}
              >
                {added ? 'Ajouté au panier' : 'Ajouter au panier'}
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
