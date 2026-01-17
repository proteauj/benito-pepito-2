'use client';

import { products } from '../data/products';
import ProductCard from '../products/ProductCard';
import { useRouter } from 'next/navigation';

export default function ProductsPage() {
  const router = useRouter();

  return (
    <div className="flex flex-wrap -m-2">
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onClick={() => router.push(`/product/${product.id}`)}
          useFullImg={false} // miniature
          expanded={false}    // liste compacte
        />
      ))}
    </div>
  );
}