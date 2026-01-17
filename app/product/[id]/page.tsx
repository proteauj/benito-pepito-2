'use client';

import { products } from '../../data/products';
import { useParams } from 'next/navigation';
import ProductCard from '../../products/ProductCard';

export default function ProductPage() {
  const params = useParams();
  const product = products.find(p => p.id === params.id);

  if (!product) return <p>Produit introuvable</p>;

  return (
    <div className="container mx-auto px-4 py-8 bg-white">
      <ProductCard
        product={product}
        useFullImg={true}
        expanded={true}  // affiche tous les détails + bouton
      />
    </div>
  );
}
