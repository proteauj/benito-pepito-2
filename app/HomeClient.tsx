'use client';
import CategorySlideshow from './components/CategorySlideshow';
import { Product } from '@/lib/db/types';
import Link from 'next/link';

type ProductsByCategory = Record<string, Product[]>;

type Props = {
  productsByCategory: ProductsByCategory;
};

export default function HomeClient({ productsByCategory }: Props) {
  const categoriesToShow = ['Galerie', 'Maison & Jardin', 'Sculpture', 'Impression 3D'];

  const slugMap: Record<string, string> = {
    'Galerie': 'galerie',
    'Maison & Jardin': 'maison-jardin',  // <-- doit correspondre au slug
    'Sculpture': 'sculpture',
    'Impression 3D': 'impression-3d',
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      <div className="flex flex-wrap -mx-4">
        {categoriesToShow.map(category => {
          const products = productsByCategory[category] ?? [];
          if (!products.length) return null;

          return (
            <div key={category} className="w-full sm:w-1/2 lg:w-1/3 px-4 mb-8">
              <h2 className="text-2xl font-bold text-black mb-4 px-4 sm:px-0">
                <Link href={`/products?category=${slugMap[category]}`} className="hover:text-[var(--leaf)]">
                  {category}
                </Link>
              </h2>
              <CategorySlideshow
                key={category}
                category={category}
                products={products}
              />
            </div>
          );
        })}
      </div>
    </main>
  );
}