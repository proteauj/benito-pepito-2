'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProductCard from '../../products/ProductCard';
import { useCart } from '../../contexts/CartContext';
import { Product } from '../../../lib/db/types';

export default function ProductPage() {
  const params = useParams();
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [realStock, setRealStock] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products?id=${params.id}`);
        const data = await res.json();

        if (data) {
          setRealStock(data.inStock ?? true);
          setProduct(data);
        } else {
          setProduct(null);
          setRealStock(null);
        }

        console.log('product', product);
      } catch (err) {
        console.error(err);
        setProduct(null);
        setRealStock(null);
      }
    };

    fetchProduct();
  }, [params.id]);

  if (product === null && realStock === null) return <p className="text-center py-8">Chargement…</p>;
  if (product === null) return <p className="text-center py-8">Produit introuvable</p>;

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
  };

  return (
    <div className="relative z-0">
      <div className="stoneBg absolute inset-0 -z-10"></div> {/* fond derrière */}
      <div className="relative z-0 min-h-screen flex flex-col items-center px-4 py-8 stoneBg">
        <ProductCard
          key={product.id}
          product={{ ...product, inStock: realStock! }}
          useFullImg={true}
          expanded={true}
          onAddToCart={handleAddToCart}
          keepImgProportions={true}
          added={added}
          className="max-w-md w-full" // limite la largeur et centre le card
        />
      </div>
    </div>
  );
}