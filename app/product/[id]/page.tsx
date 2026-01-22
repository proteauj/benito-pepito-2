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

        if (data.product) {
          setProduct(data.product);
          setRealStock(data.productStock?.inStock ?? data.product.inStock); // priorité DB
        } else {
          setProduct(null);
          setRealStock(null);
        }
      } catch (err) {
        console.error(err);
        setProduct(null);
        setRealStock(null);
      }
    };

    fetchProduct();
  }, [params.id]);

  if (!product) return <p className="text-center py-8">Produit introuvable</p>;
  if (realStock === null) return <p className="text-center py-8">Chargement…</p>;

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
  };

  return (
    <div className="relative z-0">
      <div className="stoneBg absolute inset-0 -z-10"></div> {/* fond derrière */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 relative z-10">
        <ProductCard
          key={product.id}
          product={{ ...product, inStock: realStock }} // passer le stock réel
          useFullImg={true}
          expanded={true}
          onAddToCart={handleAddToCart}
          keepImgProportions={true}
          added={added}
        />
      </div>
    </div>
  );
}