'use client';
import CategorySlideshow from './components/CategorySlideshow';
import { Product } from '@/lib/db/types';

type ProductsByCategory = Record<string, Product[]>;

type Props = {
  productsByCategory: ProductsByCategory;
};

export default function HomeClient({ productsByCategory }: Props) {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {Object.entries(productsByCategory).map(([category, products]) => (
        <CategorySlideshow
          key={category}
          category={category}
          products={products ?? []} // sécurité
        />
      ))}
    </main>
  );
}
