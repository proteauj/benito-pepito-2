'use client';

import { products } from '../data/products';
import ProductCard from '../products/ProductCard';
import { useRouter } from 'next/navigation';

export default function ProductsPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Nos Peintures</h1>

      {/* Grille 4 colonnes avec gap stable */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={() => router.push(`/product/${product.id}`)}
            expanded={false}
            useFullImage={false}
          />
        ))}
      </div>
    </div>
  );
}