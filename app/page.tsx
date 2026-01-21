'use client';

import { useEffect, useState } from 'react';
import { useI18n } from './i18n/I18nProvider';
import { Product } from '../lib/db/types';
import { products } from './data/products';

type ProductsByCategory = Record<string, Product[]>;
import HomeClient from './HomeClient';

export default function HomePage() {

  // Grouper dès le serveur
  const productsByCategory: ProductsByCategory = (products as Product[]).reduce(
    (acc: ProductsByCategory, product) => {
      if (!acc[product.category]) acc[product.category] = [];
      acc[product.category].push(product);
      return acc;
    },
    {} as ProductsByCategory
  );

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

  return <HomeClient productsByCategory={productsByCategory} />;
}