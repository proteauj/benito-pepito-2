'use client';

import { products } from '../../data/products';
import { useParams } from 'next/navigation';
import ProductCard from '../../products/ProductCard';

export default function ProductPage() {
  const params = useParams(); // id du produit depuis l'URL
  const product = products.find(p => p.id === params.id);

  if (!product) return <p className="text-center py-8">Produit introuvable</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="container mx-auto px-4 py-8 relative z-10">
        <ProductCard
          product={product}
          expanded={true}
          useFullImg={true}
          showAddToCart={true}
        />
      </div>
    </div>
  );
}