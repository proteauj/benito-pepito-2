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
      <div className="flex flex-wrap -mx-4"> {/* conteneur flex */}
        {Object.entries(productsByCategory)?.map(([category, products]) => (
          <div key={category} className="w-full sm:w-1/2 lg:w-1/3 px-4 mb-8">
            <CategorySlideshow
              key={category}
              category={category}
              products={products ?? []} // sécurité
            />
          </div>
        ))}
      </div>
    </main>
  );
}
