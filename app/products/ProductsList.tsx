'use client';
import { Product } from '@/lib/db/types';
import ProductCard from './ProductCard';
import { useRouter } from 'next/navigation';

interface ProductsListProps {
  products: Product[];
  category?: string;
}

export default function ProductsList({ products, category }: ProductsListProps) {
  const router = useRouter();

  const filteredProducts = category && category !== 'All'
    ? products.filter(p => p.category === category)
    : products;

  if (!filteredProducts.length) return <p>Aucune œuvre trouvée.</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
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
