'use client';

import { useEffect, useState } from 'react';
import { useI18n } from './i18n/I18nProvider';
import { Product } from '../lib/db/types';
import { products } from './data/products';

type ProductsByCategory = Record<string, Product[]>;
import HomeClient from './HomeClient';

export default async function HomePage() {
  const { t } = useI18n();
  const [productsByCategory, setProductsByCategory] = useState<ProductsByCategory>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track homepage visit
  useEffect(() => {
    const trackVisit = async () => {
      try {
        await fetch('/api/analytics/track?page=homepage', {
          method: 'POST',
        });
      } catch (error) {
        console.debug('Analytics tracking failed:', error);
      }
    };

    trackVisit();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = products.reduce((acc: ProductsByCategory, product) => {
          if (!acc[product.category]) {
            acc[product.category] = [];
          }
          acc[product.category].push(product);
          return acc;
        }, {});
        setProductsByCategory(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white/95 border border-[#cfc9c0] shadow px-16 py-12 text-center w-full max-w-md">
          <div className="animate-spin rounded-full h-16 w-16 border-2 border-[var(--leaf)] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-xl font-semibold text-[var(--leaf)]">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  return <HomeClient products={products} />;
}