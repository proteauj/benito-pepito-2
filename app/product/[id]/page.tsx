'use client';

import { products } from '../../data/products';
import ProductCard from '../../products/ProductCard';
import { useParams } from 'next/navigation';

export default function ProductPage() {
  const params = useParams();
  const product = products.find(p => p.id === params.id);

  if (!product) return <p className="text-center py-8">Produit introuvable</p>;

  return (
    <div className="container mx-auto px-4 py-8 bg-white">
      <ProductCard product={product} expanded useFullImage />
    </div>
  );
}