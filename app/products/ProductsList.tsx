// app/products/ProductsList.tsx
'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from './ProductCard';
import { Product } from '@/lib/db/types';

export default function ProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || 'All';

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        let allProducts: Product[] = [];
        Object.values(data).forEach(arr => allProducts.push(...(arr as Product[])));
        setProducts(category === 'All' ? allProducts : allProducts.filter(p => p.category === category));
      })
      .finally(() => setLoading(false));
  }, [category]);

  if (loading) return <p>Chargement des œuvres...</p>;
  if (!products.length) return <p>Aucune œuvre trouvée.</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={() => {} } // optional if needed
          />
        ))}
      </div>
    </div>
  );
}