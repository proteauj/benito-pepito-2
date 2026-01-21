'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from './contexts/CartContext';
import CategorySlideshow from './components/CategorySlideshow';
import { useI18n } from './i18n/I18nProvider';
import { Product } from '@/lib/db/types';

type ProductsByCategory = Record<string, Product[]>;

export default function HomeClient({ products }: { products: Product[] }) {
  const { t } = useI18n();
  const { itemCount, toggleCart } = useCart();

  const [productsByCategory, setProductsByCategory] =
    useState<ProductsByCategory>({});

  useEffect(() => {
    const grouped = products.reduce((acc, product) => {
      acc[product.category] ??= [];
      acc[product.category].push(product);
      return acc;
    }, {} as ProductsByCategory);

    setProductsByCategory(grouped);
  }, [products]);

  return (
    <div className="min-h-screen stoneBg">
      <main className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold">{t('nav.home')}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mt-8">
          {Object.entries(productsByCategory).map(([category, products]) => (
            <CategorySlideshow
              key={category}
              category={category}
              products={products}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
