'use client';

import { JSXElementConstructor, ReactElement, ReactNode, ReactPortal, useEffect, useState } from 'react';
import { Product } from '../../lib/db/types';
import { sizeDimensions } from '../data/dimensions';
import { useI18n } from '../i18n/I18nProvider'

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
  const { t } = useI18n();
  const [dims, setDims] = useState<{
    width: number;
    height: number;
    unit: string;
  }[]>([]);

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
        if (data && typeof data.inStock === 'boolean') {
          setRealStock(data.inStock);
        } else {
          setRealStock(product.inStock);
        }

        // ⚡ mettre à jour le state React
        setDims(sizeDimensions[data.size] || []);
        console.log('fetchStock', data);
        console.log('dims', sizeDimensions[data.size]);
      } catch (err) {
        console.error('Erreur récupération stock', err);
        setRealStock(product.inStock); // fallback
        const dimsForSize = product.size ? sizeDimensions[product.size] : [];
        setDims(dimsForSize);
      }
    };

    fetchStock();
  }, [product.id, product.inStock, product.size]);

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
            w-full max-w-[300px] overflow-hidden mx-auto
            ${!useFullImg && !keepImgProportions ? 'aspect-square' : ''}
          `}
        >
          <img
            src={useFullImg ? product.image : product.imageThumbnail || product.image || '/placeholder.png'}
            alt={product.titleFr}
            className={`
              block mx-auto relative z-10
              ${keepImgProportions ? 'h-auto object-contain' : 'h-full object-cover w-full'}
            `}
          />
        </div>

        {expanded && (
          <div className="bg-white p-2">
            <p className="font-bold text-sm truncate">{product.titleFr || product.title}</p>
            <p className="text-xs mb-2">{product.size}</p>
            <p className="text-xs mb-2">{product.materialFr}</p>
            <p className="text-xs mb-2">{product.price} $</p>

            {product.size && sizeDimensions[product.size] ? (
              <div className="text-xs mb-2">
                <p className="font-semibold">{t('dim.dimensions')}</p>
                

                {dims?.length === 2 ? (
                  <ul className="mt-1 space-y-0.5">
                    <li>
                      {t('dim.between')}{' '}
                      <span>
                        {dims[0].width}" × {dims[0].height}" {dims[0].unit}
                      </span>{' '}
                      {t('dim.and')}{' '}
                      <span>
                        {dims[1].width}" × {dims[1].height}" {dims[1].unit}
                      </span>
                    </li>
                  </ul>
                ) : dims?.length === 1 ? (
                  <span>
                    {dims[0].width}" × {dims[0].height}" {dims[0].unit}
                  </span>
                ) : (
                  <span>{t('dim.noDimensions')}</span>
                )}
              </div>
            
            ):(<></>)}

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
