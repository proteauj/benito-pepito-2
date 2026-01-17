// app/products/ProductsList.tsx
'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from './ProductCard';
import { Product } from '@/lib/db/types';
import { useRouter } from 'next/navigation';

export default function ProductsList() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || 'All';

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch('/api/products');
      let result: Product[] = await response.json();

      let allProducts: Product[] = [];
      Object.values(result).forEach(arr => allProducts.push(...(arr as unknown as Product[])));
      setProducts(category === 'All' ? allProducts : allProducts.filter(p => p.category === category));

      setLoading(false);
    };
    fetchProducts();
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
            onClick={() => router.push(`/product/${product.id}`)}
          />
        ))}
      </div>
    </div>
  );
}